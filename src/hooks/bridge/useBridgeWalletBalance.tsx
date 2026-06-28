import { useQuery } from '@tanstack/react-query';
import { BigNumber, Contract } from 'ethers';
import { useRootStore } from 'src/store/root';
import { POLLING_INTERVAL, queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export interface UseBridgeTokensParams {
  chainId: number;
  ghoTokenAddress: string;
  tokenOracle: string;
  walletBalanceProviderAddress: string;
}

export const useBridgeTokens = ({
  chainId,
  ghoTokenAddress,
  tokenOracle,
  walletBalanceProviderAddress,
}: UseBridgeTokensParams) => {
  const { poolTokensBalanceService } = useSharedDependencies();
  const user = useRootStore((store) => store.account);

  return useQuery({
    queryFn: async () => {
      const provider = getProvider(chainId);
      const oracle = new Contract(
        tokenOracle,
        [
          'function latestAnswer() public view returns (int256 answer)',
          'function decimals() external view returns (uint8)',
        ],
        provider
      );

      const [latestAnswer, decimals]: [BigNumber, number] = await Promise.all([
        oracle.latestAnswer(),
        oracle.decimals(),
      ]);

      const balances = await poolTokensBalanceService.getGhoBridgeBalancesTokenBalances(
        chainId,
        ghoTokenAddress,
        walletBalanceProviderAddress,
        user
      );

      return {
        ...balances,
        tokenPriceUSD: latestAnswer.toNumber() / BigNumber.from(10).pow(decimals).toNumber(),
      };
    },
    queryKey: queryKeysFactory.getGhoBridgeBalances(user, chainId),
    enabled: !!user,
    refetchInterval: POLLING_INTERVAL,
    initialData: {
      bridgeTokenBalance: '0',
      bridgeTokenBalanceFormatted: '0',
      tokenPriceUSD: 1,
      address: ghoTokenAddress,
    },
  });
};
