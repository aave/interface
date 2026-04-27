/**
 * Merit incentive adapter over the V3 backend.
 *
 * Legacy signature preserved: caller passes `{ market, symbol, protocolAction,
 * protocolAPY, protocolIncentives }`. Resolves `(market, symbol)` to the
 * underlying reserve via `useAppDataContext`, then reads
 * `MeritSupply/Borrow/Conditional` incentives from `useReserveIncentives`.
 *
 * All per-campaign display data (reward token, custom message, forum link,
 * self APR) comes from the backend — the legacy `MERIT_DATA_MAP` hardcoded
 * in this file is deleted.
 */
import { ProtocolAction } from '@aave/contract-helpers';
import type { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { convertAprToApy } from 'src/utils/utils';

import { useReserveIncentives } from './useReserveIncentives';

// The backend returns `action_key` as an opaque slug (e.g. `"ethereum-sgho"`).
// `MeritAction` here is a const object + string type so callsites that
// switch on specific actions (`MeritAction.CELO_SUPPLY_USDT`, etc) keep
// working. Only slugs referenced by the interface need to appear here —
// new campaigns come from the backend as raw strings.
export const MeritAction = {
  ETHEREUM_SGHO: 'ethereum-sgho',
  CELO_SUPPLY_CELO: 'celo-supply-celo',
  CELO_SUPPLY_USDT: 'celo-supply-usdt',
  CELO_SUPPLY_USDC: 'celo-supply-usdc',
  CELO_SUPPLY_WETH: 'celo-supply-weth',
  CELO_SUPPLY_MULTIPLE_BORROW_USDT: 'celo-supply-multiple-borrow-usdt',
  CELO_BORROW_CELO: 'celo-borrow-celo',
  CELO_BORROW_USDT: 'celo-borrow-usdt',
  CELO_BORROW_USDC: 'celo-borrow-usdc',
  CELO_BORROW_WETH: 'celo-borrow-weth',
} as const;
export type MeritAction = string;

export const ENABLE_SELF_CAMPAIGN = true;

export type MeritIncentivesBreakdown = {
  protocolAPY: number;
  protocolIncentivesAPR: number;
  meritIncentivesAPR: number;
  totalAPY: number;
  isBorrow: boolean;
  breakdown: {
    protocol: number;
    protocolIncentives: number;
    meritIncentives: number;
  };
};

export type ExtendedReserveIncentiveResponse = ReserveIncentiveResponse & {
  action?: MeritAction;
  customMessage?: string;
  customForumLink?: string;
  activeActions: MeritAction[];
  actionMessages: Record<string, { customMessage?: string; customForumLink?: string }>;
  variants: { selfAPY: number | null };
  breakdown: MeritIncentivesBreakdown;
};

type UseMeritIncentivesArgs = {
  market: string;
  symbol: string;
  protocolAction?: ProtocolAction;
  protocolAPY?: number;
  protocolIncentives?: ReserveIncentiveResponse[];
};

export const useMeritIncentives = ({
  market,
  symbol,
  protocolAction,
  protocolAPY = 0,
  protocolIncentives = [],
}: UseMeritIncentivesArgs) => {
  const chainId = useRootStore((s) => s.currentChainId);
  const { supplyReserves } = useAppDataContext();

  // Resolve symbol → underlying via the reserves snapshot.
  const reserve = symbol
    ? supplyReserves.find((r) => r.underlyingToken.symbol.toLowerCase() === symbol.toLowerCase())
    : undefined;
  const underlying = reserve?.underlyingToken.address;

  const query = useReserveIncentives({
    market,
    underlying: underlying ?? '',
    chainId,
    enabled: Boolean(market && underlying && chainId && protocolAction),
  });

  if (!query.data) {
    return { ...query, data: null };
  }

  const isBorrow = protocolAction === ProtocolAction.borrow;
  const merits = query.data.filter((i) => {
    if (isBorrow) {
      return (
        i.__typename === 'MeritBorrowIncentive' ||
        i.__typename === 'MeritBorrowAndSupplyIncentiveCondition'
      );
    }
    return (
      i.__typename === 'MeritSupplyIncentive' ||
      i.__typename === 'MeritBorrowAndSupplyIncentiveCondition'
    );
  });

  if (merits.length === 0) {
    return { ...query, data: null };
  }

  let totalMeritAPR = 0;
  let totalSelfAPR = 0;
  let hasSelf = false;

  const activeActions: string[] = [];
  const actionMessages: Record<string, { customMessage?: string; customForumLink?: string }> = {};
  let firstRewardTokenAddress = '';
  let firstRewardTokenSymbol = '';
  let firstAction: string | undefined;

  // Runtime fields added to the GraphQL union variants but not yet
  // reflected in the SDK's generated TypeScript types (needs gql.tada
  // regen). We access them via a loose shape until the SDK ships.
  type EnrichedMerit = {
    __typename?: string;
    actionKey?: string | null;
    rewardTokenAddress?: string | null;
    rewardTokenSymbol?: string | null;
    customMessage?: string | null;
    customForumLink?: string | null;
    selfApr?: { formatted: string; value: string } | null;
  };

  for (const m of merits) {
    let apr = 0;
    const enriched = m as unknown as EnrichedMerit;
    const rewardTokenAddress = enriched.rewardTokenAddress ?? '';
    const rewardTokenSymbol = enriched.rewardTokenSymbol ?? '';

    if (m.__typename === 'MeritSupplyIncentive') {
      apr = parseFloat(m.extraSupplyApr.formatted);
    } else if (m.__typename === 'MeritBorrowIncentive') {
      apr = parseFloat(m.borrowAprDiscount.formatted);
    } else if (m.__typename === 'MeritBorrowAndSupplyIncentiveCondition') {
      apr = parseFloat(m.extraApr.formatted);
    }

    if (!Number.isFinite(apr) || apr <= 0) continue;

    totalMeritAPR += apr;
    const actionKey = enriched.actionKey ?? '';
    if (actionKey) {
      activeActions.push(actionKey);
      actionMessages[actionKey] = {
        customMessage: enriched.customMessage ?? undefined,
        customForumLink: enriched.customForumLink ?? undefined,
      };
      if (!firstAction) firstAction = actionKey;
    }
    if (!firstRewardTokenAddress && rewardTokenAddress) {
      firstRewardTokenAddress = rewardTokenAddress;
    }
    if (!firstRewardTokenSymbol && rewardTokenSymbol) {
      firstRewardTokenSymbol = rewardTokenSymbol;
    }

    if (ENABLE_SELF_CAMPAIGN && enriched.selfApr) {
      const self = parseFloat(enriched.selfApr.formatted);
      if (Number.isFinite(self) && self > 0) {
        totalSelfAPR += self;
        hasSelf = true;
      }
    }
  }

  if (totalMeritAPR === 0 && !hasSelf) {
    return { ...query, data: null };
  }

  const meritIncentivesAPY = convertAprToApy(totalMeritAPR / 100);
  const selfIncentivesAPY = hasSelf ? convertAprToApy(totalSelfAPR / 100) : null;

  const protocolIncentivesAPR = protocolIncentives.reduce((sum, inc) => {
    return sum + (inc.incentiveAPR === 'Infinity' ? 0 : +inc.incentiveAPR);
  }, 0);

  const totalAPY = isBorrow
    ? protocolAPY - protocolIncentivesAPR - meritIncentivesAPY - (selfIncentivesAPY ?? 0)
    : protocolAPY + protocolIncentivesAPR + meritIncentivesAPY + (selfIncentivesAPY ?? 0);

  const extended: ExtendedReserveIncentiveResponse = {
    incentiveAPR: meritIncentivesAPY.toString(),
    rewardTokenAddress: firstRewardTokenAddress,
    rewardTokenSymbol: firstRewardTokenSymbol,
    activeActions,
    actionMessages,
    action: firstAction,
    customMessage: firstAction ? actionMessages[firstAction]?.customMessage : undefined,
    customForumLink: firstAction ? actionMessages[firstAction]?.customForumLink : undefined,
    variants: { selfAPY: selfIncentivesAPY },
    breakdown: {
      protocolAPY,
      protocolIncentivesAPR,
      meritIncentivesAPR: meritIncentivesAPY,
      totalAPY,
      isBorrow,
      breakdown: {
        protocol: protocolAPY,
        protocolIncentives: protocolIncentivesAPR,
        meritIncentives: meritIncentivesAPY,
      },
    },
  };

  return { ...query, data: extended };
};
