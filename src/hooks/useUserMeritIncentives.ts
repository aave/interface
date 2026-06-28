import { useQuery } from '@tanstack/react-query';
import { convertAprToApy } from 'src/utils/utils';

import { MeritAction } from './useMeritIncentives';

type UserMeritIncentives = {
  totalAPR: number;
  actionsAPR: {
    [key in MeritAction]: number | null | undefined;
  };
};

type UserMeritIncentivesResponse = {
  previousAPR: UserMeritIncentives | null;
  currentAPR: UserMeritIncentives;
};

const url = 'https://apps.aavechan.com/api/merit/aprs';

export const useUserMeritIncentives = (userAddress?: string) => {
  return useQuery({
    queryFn: async () => {
      if (!userAddress) {
        return null;
      }

      const response = await fetch(`${url}?user=${userAddress}`);
      const data: UserMeritIncentivesResponse = await response.json();

      return data;
    },
    queryKey: ['userMeritIncentives', userAddress],
    staleTime: 1000 * 60 * 60, // 1 hour
    enabled: !!userAddress,
    select: (data) => {
      if (!data) {
        return null;
      }

      // Convert all APR values to APY using monthly compounding
      const convertedActionsAPY: Record<string, number> = {};

      Object.entries(data.currentAPR.actionsAPR).forEach(([action, apr]) => {
        if (apr !== null && apr !== undefined) {
          const aprDecimal = apr / 100; // Convert to decimal
          const apy = convertAprToApy(aprDecimal);
          convertedActionsAPY[action] = apy * 100; // Convert back to percentage
        }
      });

      return {
        ...data,
        currentAPR: {
          ...data.currentAPR,
          actionsAPY: convertedActionsAPY, // Add converted APY values
        },
      };
    },
  });
};
