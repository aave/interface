import { Power } from '@aave/contract-helpers';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { POOLING_INTERVAL, QueryKeys } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export interface Powers {
  votingPower: string;
  aaveTokenPower: Power;
  stkAaveTokenPower: Power;
  propositionPower: string;
  aaveVotingDelegatee: string;
  aavePropositionDelegatee: string;
  stkAaveVotingDelegatee: string;
  stkAavePropositionDelegatee: string;
}

type UsePowersArgs = {
  user: string;
};

export const usePowers = ({ user }: UsePowersArgs): UseQueryResult<Powers, Error> => {
  const { governanceService } = useSharedDependencies();
  return useQuery({
    queryFn: () => governanceService.getPowers({ user }),
    queryKey: [QueryKeys.USE_POWERS, user],
    enabled: !!user,
    refetchInterval: POOLING_INTERVAL,
  });
};
