/**
 * Merkl points incentive adapter over the V3 backend.
 *
 * Legacy signature preserved: caller passes `market` + `rewardedAsset`
 * (aToken/vToken) + `protocolAction` + optional `protocolAPY` +
 * `protocolIncentives` + `enabled`. Resolves rewardedAsset → underlying
 * via `useAppDataContext` and reads `SupplyPointsIncentive` /
 * `BorrowPointsIncentive` from `useReserveIncentives`.
 */
import { ProtocolAction } from '@aave/contract-helpers';
import type { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { convertAprToApy } from 'src/utils/utils';

import {
  ExtendedReserveIncentiveResponse,
  MerklIncentivesBreakdown,
} from './useMerklIncentives';
import { useReserveIncentives } from './useReserveIncentives';

type UseMerklPointsIncentivesArgs = {
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
  protocolAPY?: number;
  protocolIncentives?: ReserveIncentiveResponse[];
  enabled?: boolean;
};

export const useMerklPointsIncentives = ({
  market,
  rewardedAsset,
  protocolAction,
  protocolAPY = 0,
  protocolIncentives = [],
  enabled = true,
}: UseMerklPointsIncentivesArgs) => {
  const chainId = useRootStore((s) => s.currentChainId);
  const { supplyReserves, borrowReserves } = useAppDataContext();

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
    enabled:
      enabled && Boolean(market && underlying && chainId && protocolAction),
  });

  const isBorrow = protocolAction === ProtocolAction.borrow;
  const targetTypename = isBorrow
    ? 'BorrowPointsIncentive'
    : 'SupplyPointsIncentive';

  const incentive = query.data?.find((i) => i.__typename === targetTypename);

  if (
    !incentive ||
    (incentive.__typename !== 'SupplyPointsIncentive' &&
      incentive.__typename !== 'BorrowPointsIncentive')
  ) {
    return { ...query, data: null };
  }

  const merklIncentivesAPY = 0;

  const protocolIncentivesAPR = protocolIncentives.reduce((sum, inc) => {
    return sum + (inc.incentiveAPR === 'Infinity' ? 0 : +inc.incentiveAPR);
  }, 0);
  const protocolIncentivesAPY = convertAprToApy(protocolIncentivesAPR);

  const totalAPY = isBorrow
    ? protocolAPY - protocolIncentivesAPY - merklIncentivesAPY
    : protocolAPY + protocolIncentivesAPY + merklIncentivesAPY;

  // dailyPoints / pointsPerThousandUsd / custom copy fields ship in the
  // GraphQL Points variants but aren't in the SDK's TypeScript types yet.
  const enriched = incentive as unknown as {
    dailyPoints?: number | null;
    pointsPerThousandUsd?: number | null;
    customMessage?: string | null;
    customForumLink?: string | null;
  };
  const dailyPoints = enriched.dailyPoints ?? 0;
  const pointsPerThousandUsd = enriched.pointsPerThousandUsd ?? 0;

  const breakdown: MerklIncentivesBreakdown = {
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
    points: { dailyPoints, pointsPerThousandUsd },
  };

  const extended: ExtendedReserveIncentiveResponse & {
    points: { dailyPoints: number; pointsPerThousandUsd: number };
  } = {
    incentiveAPR: '0',
    rewardTokenAddress: '',
    rewardTokenSymbol: incentive.program?.name ?? 'points',
    customMessage: enriched.customMessage ?? undefined,
    customForumLink: enriched.customForumLink ?? undefined,
    breakdown,
    points: { dailyPoints, pointsPerThousandUsd },
  };

  return { ...query, data: extended };
};
