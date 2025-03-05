import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { useZkSyncIgniteIncentives } from 'src/hooks/useZkSyncIgniteIncentives';

import { usePointsIncentives } from './usePointsIncentives';
import { useSimpleExternalIncentives } from './useSimpleExternalIncentives';

export const useAllIncentives = ({
  symbol,
  rewardedAsset,
  market,
  protocolAction,
  lmIncentives,
}: {
  symbol: string;
  market: string;
  rewardedAsset?: string;
  protocolAction?: ProtocolAction;
  lmIncentives?: ReserveIncentiveResponse[];
}) => {
  // APRs incentives
  const { data: meritIncentives } = useMeritIncentives({
    symbol,
    market,
    protocolAction,
  });
  const { data: zkSyncIgniteIncentives } = useZkSyncIgniteIncentives({
    market,
    rewardedAsset,
    protocolAction,
  });

  const lmIncentivesFiltered = lmIncentives?.filter((i) => i.incentiveAPR !== '0');

  const meritApr =
    meritIncentives && meritIncentives.incentiveAPR ? Number(meritIncentives?.incentiveAPR) : 0;
  const zkSyncApr =
    zkSyncIgniteIncentives && zkSyncIgniteIncentives.incentiveAPR
      ? Number(zkSyncIgniteIncentives?.incentiveAPR)
      : 0;
  const lmApr = lmIncentivesFiltered?.reduce((a, b) => a + +b.incentiveAPR, 0) ?? 0;

  const totalApr = meritApr + zkSyncApr + lmApr;

  const allIncentives = [
    ...(meritIncentives ? [meritIncentives] : []),
    ...(zkSyncIgniteIncentives ? [zkSyncIgniteIncentives] : []),
    ...(lmIncentivesFiltered || []),
  ];
  const allAprsIncentivesCount = allIncentives.length;

  // Simple external incentives
  const pointsIncentivesTooltips = usePointsIncentives({ market, rewardedAsset });
  const pointsIncentivesCount = Object.values(pointsIncentivesTooltips).filter(Boolean).length;

  // Simple external incentives
  const simpleExternalIncentivesTooltips = useSimpleExternalIncentives({ market, rewardedAsset });
  const simpleExternalIncentivesCount = Object.values(simpleExternalIncentivesTooltips).filter(
    Boolean
  ).length;

  const incentivesCount =
    allAprsIncentivesCount + pointsIncentivesCount + simpleExternalIncentivesCount;

  return { allIncentives, totalApr, incentivesCount };
};
