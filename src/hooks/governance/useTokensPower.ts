import { useQueries } from '@tanstack/react-query';
import { FixedPointDecimal } from 'src/architecture/FixedPointDecimal';
import { TokenDelegationPower } from 'src/services/DelegationTokenService';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

export const useTokensPowers = (tokens: string[]) => {
  const { delegationTokenService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);
  return useQueries({
    queries: tokens.map((token) => ({
      queryFn: () =>
        delegationTokenService.getTokenPowers(user, token, governanceV3Config.coreChainId),
      queryKey: queryKeysFactory.tokenPowers(user, token, governanceV3Config.coreChainId),
      enabled: !!user,
    })),
  });
};

export const useTotalTokensPowers = (tokens: string[]) => {
  const queries = useTokensPowers(tokens);
  const isLoading = queries.some((elem) => elem.isLoading);
  const error = queries.find((elem) => elem.error)?.error;
  const allData = queries.reduce((acum, elem) => {
    if (elem.data) {
      return acum.concat([elem.data]);
    }
    return acum;
  }, [] as TokenDelegationPower[]);
  if (allData.length !== tokens.length) {
    return {
      data: undefined,
      isLoading,
      error,
    };
  }
  return {
    data: allData.reduce(
      (acum, elem) => {
        return {
          propositionPower: acum.propositionPower.add(elem.propositionPower),
          votingPower: acum.votingPower.add(elem.votingPower),
        };
      },
      {
        propositionPower: new FixedPointDecimal(0, 18),
        votingPower: new FixedPointDecimal(0, 18),
      }
    ),
  };
};
