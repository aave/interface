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

export const useMeritIncentives = () => {
  return useQuery({
    queryFn: async () => {
      const response = await fetch(url);
      const data = await response.json();
      return data.currentAPR as MeritIncentives;
    },
    queryKey: ['meritIncentives'],
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
  });
};
