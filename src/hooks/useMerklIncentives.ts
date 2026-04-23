/**
 * Merkl incentive adapter over the V3 backend.
 *
 * Legacy signature preserved: caller passes `market` + `rewardedAsset`
 * (aToken address) + `protocolAction` + optional `protocolAPY` +
 * `protocolIncentives`. The hook resolves the aToken to its underlying
 * reserve via `useAppDataContext`, then reads the matching `MerklSupply` or
 * `MerklBorrow` incentive from `useReserveIncentives`. Live APR, partner
 * copy (description, customMessage, customForumLink, customClaimMessage),
 * and payout token come from the backend.
 *
 * The return shape matches the legacy `ExtendedReserveIncentiveResponse`
 * so existing renderers (`MerklIncentivesTooltipContent`, `IncentivesCard`,
 * `useUserYield`) keep working unchanged.
 */
import { ProtocolAction } from '@aave/contract-helpers';
import type { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { convertAprToApy } from 'src/utils/utils';

import { useReserveIncentives } from './useReserveIncentives';

export type MerklIncentivesBreakdown = {
  protocolAPY: number;
  protocolIncentivesAPR: number;
  merklIncentivesAPR: number;
  totalAPY: number;
  isBorrow: boolean;
  breakdown: {
    protocol: number;
    protocolIncentives: number;
    merklIncentives: number;
  };
  points?: {
    dailyPoints: number;
    pointsPerThousandUsd: number;
  };
};

type ReserveIncentiveAdditionalData = {
  customClaimMessage?: string;
  customMessage?: string;
  customForumLink?: string;
};

export type ExtendedReserveIncentiveResponse = ReserveIncentiveResponse &
  ReserveIncentiveAdditionalData & {
    breakdown: MerklIncentivesBreakdown;
    description?: string;
  };

type UseMerklIncentivesArgs = {
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
  protocolAPY?: number;
  protocolIncentives?: ReserveIncentiveResponse[];
};

export const useMerklIncentives = ({
  market,
  rewardedAsset,
  protocolAction,
  protocolAPY = 0,
  protocolIncentives = [],
}: UseMerklIncentivesArgs) => {
  const chainId = useRootStore((s) => s.currentChainId);
  const { supplyReserves, borrowReserves } = useAppDataContext();

  // Resolve rewardedAsset (aToken or vToken) → underlying via the reserves
  // snapshot. Supply side uses `aToken.address`; borrow side uses
  // `vToken.address`.
  const reserves =
    protocolAction === ProtocolAction.borrow ? borrowReserves : supplyReserves;
  const reserve = rewardedAsset
    ? reserves.find(
        (r) =>
          (protocolAction === ProtocolAction.borrow
            ? r.vToken?.address
            : r.aToken?.address
          )?.toLowerCase() === rewardedAsset.toLowerCase(),
      )
    : undefined;
  const underlying = reserve?.underlyingToken.address;

  const query = useReserveIncentives({
    market,
    underlying: underlying ?? '',
    chainId,
    enabled: Boolean(market && underlying && chainId && protocolAction),
  });

  const isBorrow = protocolAction === ProtocolAction.borrow;
  const targetTypename = isBorrow
    ? 'MerklBorrowIncentive'
    : 'MerklSupplyIncentive';

  const incentive = query.data?.find((i) => i.__typename === targetTypename);

  if (!incentive) {
    return { ...query, data: null };
  }

  const aprPct =
    incentive.__typename === 'MerklSupplyIncentive'
      ? parseFloat(incentive.extraApy.formatted)
      : incentive.__typename === 'MerklBorrowIncentive'
      ? parseFloat(incentive.discountApy.formatted)
      : 0;

  const merklIncentivesAPY = Number.isFinite(aprPct) ? aprPct / 100 : 0;

  const protocolIncentivesAPR = protocolIncentives.reduce((sum, inc) => {
    return sum + (inc.incentiveAPR === 'Infinity' ? 0 : +inc.incentiveAPR);
  }, 0);
  const protocolIncentivesAPY = convertAprToApy(protocolIncentivesAPR);

  const totalAPY = isBorrow
    ? protocolAPY - protocolIncentivesAPY - merklIncentivesAPY
    : protocolAPY + protocolIncentivesAPY + merklIncentivesAPY;

  // Fields added to the Merkl*Incentive GraphQL variants but not yet in
  // the SDK's generated types. Pull them through a loose shape until the
  // SDK schema regen ships.
  const enriched = incentive as unknown as {
    description?: string | null;
    customMessage?: string | null;
    customForumLink?: string | null;
    customClaimMessage?: string | null;
  };
  const description = enriched.description ?? undefined;
  const customMessage = enriched.customMessage ?? undefined;
  const customForumLink = enriched.customForumLink ?? undefined;
  const customClaimMessage = enriched.customClaimMessage ?? undefined;

  const payoutToken =
    incentive.__typename === 'MerklSupplyIncentive' ||
    incentive.__typename === 'MerklBorrowIncentive'
      ? incentive.payoutToken
      : null;

  const extended: ExtendedReserveIncentiveResponse = {
    incentiveAPR: merklIncentivesAPY.toString(),
    rewardTokenAddress: payoutToken?.address ?? '',
    rewardTokenSymbol: '',
    description,
    customMessage,
    customForumLink,
    customClaimMessage,
    breakdown: {
      protocolAPY,
      protocolIncentivesAPR: protocolIncentivesAPY,
      merklIncentivesAPR: merklIncentivesAPY,
      totalAPY,
      isBorrow,
      breakdown: {
        protocol: protocolAPY,
        protocolIncentives: protocolIncentivesAPY,
        merklIncentives: merklIncentivesAPY,
      },
    },
  };

  return { ...query, data: extended };
};
