import { ProtocolAction } from '@aave/contract-helpers';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';

import { ENABLE_SELF_CAMPAIGN, useMeritIncentives } from './useMeritIncentives';
import { useMerklIncentives } from './useMerklIncentives';

interface UseBoostedAPYProps {
  symbol: string;
  market: string;
  protocolAction?: ProtocolAction;
  protocolAPY: number;
  incentives?: ReserveIncentiveResponse[];
  address?: string;
}

interface BoostedAPYResult {
  displayAPY: number | 'Infinity';
  protocolIncentivesAPR: number | 'Infinity';
  meritIncentivesAPR: number;
  merklIncentivesAPR: number;
  selfAPY: number;
  totalMeritAPY: number;
  hasInfiniteIncentives: boolean;
  hasIncentives: boolean;
  isBorrow: boolean;
  breakdown: {
    protocol: number;
    protocolIncentives: number | 'Infinity';
    merit: number;
    merkl: number;
    self: number;
  };
}

export const useBoostedAPY = ({
  symbol,
  market,
  protocolAction,
  protocolAPY,
  incentives = [],
  address,
}: UseBoostedAPYProps): BoostedAPYResult => {
  // Calculate protocol incentives APR
  const protocolIncentivesAPR = incentives.reduce((sum, inc) => {
    if (inc.incentiveAPR === 'Infinity' || sum === 'Infinity') {
      return 'Infinity';
    }
    return sum + +inc.incentiveAPR;
  }, 0 as number | 'Infinity');

  const { data: meritIncentives } = useMeritIncentives({
    symbol,
    market,
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives,
  });

  const { data: merklIncentives } = useMerklIncentives({
    market,
    rewardedAsset: address, // aToken for supply and variableDebtToken for borrow
    protocolAction,
    protocolAPY,
    protocolIncentives: incentives,
  });

  // Calculate individual APY components
  const meritIncentivesAPR = meritIncentives?.breakdown?.meritIncentivesAPR || 0;
  const selfAPY = ENABLE_SELF_CAMPAIGN ? meritIncentives?.variants?.selfAPY ?? 0 : 0;
  const totalMeritAPY = meritIncentivesAPR + selfAPY;
  const merklIncentivesAPR = merklIncentives?.breakdown?.merklIncentivesAPR || 0;

  const isBorrow = protocolAction === ProtocolAction.borrow;

  const hasInfiniteIncentives = protocolIncentivesAPR === 'Infinity';

  const hasIncentives =
    protocolIncentivesAPR !== 0 || meritIncentivesAPR > 0 || merklIncentivesAPR > 0 || selfAPY > 0;

  // Calculate the final boosted APY
  const displayAPY = hasInfiniteIncentives
    ? 'Infinity'
    : isBorrow
    ? protocolAPY - (protocolIncentivesAPR as number) - totalMeritAPY - merklIncentivesAPR
    : protocolAPY + (protocolIncentivesAPR as number) + totalMeritAPY + merklIncentivesAPR;

  return {
    displayAPY,
    protocolIncentivesAPR,
    meritIncentivesAPR,
    merklIncentivesAPR,
    selfAPY,
    totalMeritAPY,
    hasInfiniteIncentives,
    hasIncentives,
    isBorrow,
    breakdown: {
      protocol: protocolAPY,
      protocolIncentives: protocolIncentivesAPR,
      merit: totalMeritAPY,
      merkl: merklIncentivesAPR,
      self: selfAPY,
    },
  };
};
