import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { useQuery } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';

type MeritIncentives = {
  totalAPR: number;
  actionsAPR: {
    stkgho: number;
    gho: number;
  };
};

const url = 'https://apps.aavechan.com/api/merit/aprs';

export const useMeritIncentives = (asset: 'gho' | 'stkgho') => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch(url);
      const data = await response.json();
      return data.currentAPR as MeritIncentives;
    },
    queryKey: ['meritIncentives'],
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      // rewards are always in GHO, for now
      return {
        incentiveAPR: (data.actionsAPR[asset] / 100).toString(),
        rewardTokenAddress: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
        rewardTokenSymbol: 'GHO',
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
