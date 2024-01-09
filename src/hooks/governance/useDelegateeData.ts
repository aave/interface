import { useQueries } from '@tanstack/react-query';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useTokenDelegatees = (tokens: string[]) => {
  const { delegationTokenService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQueries({
    queries: tokens.map((token) => ({
      queryFn: () =>
        delegationTokenService.getTokenDelegatees(user, token, governanceV3Config.coreChainId),
      queryKey: queryKeysFactory.tokenDelegatees(user, token, governanceV3Config.coreChainId),
      enabled: !!user,
    })),
  });
};

export const useGovernanceDelegatees = () => {
  const queries = useTokenDelegatees(Object.values(governanceV3Config.votingAssets));
  const isLoading = queries.some((elem) => elem.isLoading);
  const error = queries.find((elem) => elem.error)?.error;
  const refetch = () => queries.forEach((elem) => elem.refetch());
  const allData = queries.reduce((acum, elem) => {
    if (elem.data) {
      return acum.concat([elem.data]);
    }
    return acum;
  }, [] as { votingDelegatee: string; propositionDelegatee: string }[]);
  if (allData.length !== 3) {
    return {
      data: undefined,
      isLoading,
      error,
      refetch,
    };
  }
  return {
    data: {
      aaveVotingDelegatee: allData[0].votingDelegatee,
      aavePropositionDelegatee: allData[0].propositionDelegatee,
      aAaveVotingDelegatee: allData[1].votingDelegatee,
      aAavePropositionDelegatee: allData[1].propositionDelegatee,
      stkAaveVotingDelegatee: allData[2].votingDelegatee,
      stkAavePropositionDelegatee: allData[2].propositionDelegatee,
    },
    refetch,
  };
};
