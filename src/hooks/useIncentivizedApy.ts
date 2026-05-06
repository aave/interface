import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { ENABLE_SELF_CAMPAIGN, useMeritIncentives } from 'src/hooks/useMeritIncentives';
import { convertAprToApy } from 'src/utils/utils';

import { useMerklIncentives } from './useMerklIncentives';
import { useMerklPointsIncentives } from './useMerklPointsIncentives';

interface IncentivizedApyParams {
  symbol: string;
  market: string;
  rewardedAsset: string;
  protocolAction?: ProtocolAction;
  protocolAPY: number | string;
  protocolIncentives?: ReserveIncentiveResponse[];
}
type UseIncentivizedApyResult = {
  displayAPY: number | 'Infinity';
  hasInfiniteIncentives: boolean;
  isLoading: boolean;
};
export const useIncentivizedApy = ({
  symbol,
  market,
  rewardedAsset: address,
  protocolAction,
  protocolAPY: value,
  protocolIncentives: incentives = [],
}: IncentivizedApyParams): UseIncentivizedApyResult => {
  const protocolAPY = typeof value === 'string' ? parseFloat(value) : value;

  const protocolIncentivesAPR =
    incentives?.reduce((sum, inc) => {
      if (inc.incentiveAPR === 'Infinity' || sum === 'Infinity') {
        return 'Infinity';
      }
      return sum + +inc.incentiveAPR;
    }, 0 as number | 'Infinity') || 0;

  const protocolIncentivesAPY = convertAprToApy(
    protocolIncentivesAPR === 'Infinity' ? 0 : protocolIncentivesAPR
  );
  const { data: meritIncentives, isLoading: meritLoading } = useMeritIncentives({
    symbol,
    market,
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives || [],
  });

  const { data: merklIncentives, isLoading: merklLoading } = useMerklIncentives({
    market,
    rewardedAsset: address,
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives || [],
  });

  const { data: merklPointsIncentives, isLoading: merklPointsLoading } = useMerklPointsIncentives({
    market,
    rewardedAsset: address,
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives || [],
  });

  const isLoading = meritLoading || merklLoading || merklPointsLoading;

  const meritIncentivesAPR = meritIncentives?.breakdown?.meritIncentivesAPR || 0;

  // TODO: This is a one-off for the Self campaign.
  // Remove once the Self incentives are finished.
  const selfAPY = ENABLE_SELF_CAMPAIGN ? meritIncentives?.variants?.selfAPY ?? 0 : 0;
  const totalMeritAPY = meritIncentivesAPR + selfAPY;

  const merklIncentivesAPR = merklPointsIncentives?.breakdown?.points
    ? merklPointsIncentives.breakdown.merklIncentivesAPR || 0
    : merklIncentives?.breakdown?.merklIncentivesAPR || 0;

  const isBorrow = protocolAction === ProtocolAction.borrow;

  // If any incentive is infinite, the total should be infinite
  const hasInfiniteIncentives = protocolIncentivesAPR === 'Infinity';

  const displayAPY = hasInfiniteIncentives
    ? 'Infinity'
    : isBorrow
    ? protocolAPY - (protocolIncentivesAPY as number) - totalMeritAPY - merklIncentivesAPR
    : protocolAPY + (protocolIncentivesAPY as number) + totalMeritAPY + merklIncentivesAPR;

  return { displayAPY, hasInfiniteIncentives, isLoading };
};
