import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { useQuery } from '@tanstack/react-query';
import { MeritReserveIncentiveData } from 'src/components/incentives/IncentivesButton';
import { useRootStore } from 'src/store/root';

export enum MeritAction {
  ETHEREUM_STKGHO = 'ethereum-stkgho',
  SUPPLY_CBBTC_BORROW_USDC = 'supply-cbtc-borrow-usdc',
}

type MeritIncentives = {
  totalAPR: number;
  actionsAPR: {
    [key in MeritAction]: number;
  };
};

const url = 'https://apps.aavechan.com/api/merit/aprs';

export const useMeritIncentives = (meritReserveIncentiveData: MeritReserveIncentiveData) => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch(url);
      const data = await response.json();
      const aprs = data.currentAPR as MeritIncentives;
      return {
        totalAPR: aprs.totalAPR,
        actionsAPR: {
          ...aprs.actionsAPR,
          'supply-cbtc-borrow-usdc': 8,
        },
      } as MeritIncentives;
    },
    queryKey: ['meritIncentives'],
    staleTime: 1000 * 60 * 5,
    select: (data) => {
      const APR = data.actionsAPR[meritReserveIncentiveData.action];
      return {
        incentiveAPR: (APR / 100).toString(),
        rewardTokenAddress: meritReserveIncentiveData.rewardTokenAddress,
        rewardTokenSymbol: meritReserveIncentiveData.rewardTokenSymbol,
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
      const aprs = data.currentAPR as MeritIncentives;
      return {
        totalAPR: aprs.totalAPR,
        actionsAPR: {
          ...aprs.actionsAPR,
          'supply-cbtc-borrow-usdc': 10,
        },
      } as MeritIncentives;
    },
    queryKey: ['meritIncentives', user],
    staleTime: 1000 * 60 * 5,
  });
};
