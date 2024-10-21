import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';

export enum MeritAction {
  ETHEREUM_STKGHO = 'ethereum-stkgho',
}

type MeritIncentives = {
  totalAPR: number;
  actionsAPR: {
    [key in MeritAction]: number;
  };
};

const url = 'https://apps.aavechan.com/api/merit/aprs';

const reservesMeritIncentives = new Map<MeritAction, ReserveIncentiveResponse>([
  [
    MeritAction.ETHEREUM_STKGHO,
    {
      incentiveAPR: '0',
      rewardTokenAddress: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
      rewardTokenSymbol: 'GHO',
    },
  ],
]);

export const useMeritIncentives = (meritAction: MeritAction) => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch(url);
      const data = await response.json();
      return data.currentAPR as MeritIncentives;
    },
    queryKey: ['meritIncentives'],
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      const reserveIncentive = reservesMeritIncentives.get(meritAction);
      if (!reserveIncentive) {
        return null;
      }
      const APR = data.actionsAPR[meritAction];
      return {
        incentiveAPR: (APR / 100).toString(),
        rewardTokenAddress: reserveIncentive.rewardTokenAddress,
        rewardTokenSymbol: reserveIncentive.rewardTokenSymbol,
      } as ReserveIncentiveResponse;
    },
  });
};

export const useUserMeritIncentives = () => {
  const user = useRootStore((store) => store.account);
  return useQuery({
    queryFn: async () => {
      const response = await fetch(`${url}?user=${user}`);
      const data = await response.json();
      return data.currentAPR as MeritIncentives;
    },
    queryKey: ['meritIncentives', user],
    staleTime: 1000 * 60 * 5,
  });
};
