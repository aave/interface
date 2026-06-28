import { useQuery } from '@tanstack/react-query';

import { MeritAction } from './useMeritIncentives';

type MeritIncentives = {
  totalAPR: number;
  actionsAPR: {
    [key in MeritAction]: number | null | undefined;
  };
};

const url = 'https://apps.aavechan.com/api/merit/aprs';

export const useStakeTokenAPR = () => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch(url);
      const data = await response.json();
      const meritIncentives = data.currentAPR as MeritIncentives;

      return meritIncentives;
    },
    queryKey: ['stakeTokenAPR'],
    staleTime: 1000 * 60 * 5, // 5 minutes
    select: (data) => {
      // Get the sGHO staking APR
      const stakeAPR = data.actionsAPR[MeritAction.ETHEREUM_SGHO];

      if (!stakeAPR) {
        return null;
      }

      return {
        apr: (stakeAPR / 100).toString(), // Convert percentage to decimal string
        aprPercentage: stakeAPR, // Keep as percentage number
      };
    },
  });
};
