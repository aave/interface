import { useQuery } from '@tanstack/react-query';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { Multicall } from 'ethereum-multicall';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { formatUnits } from '@ethersproject/units';

export const useStakeData = (marketData: MarketDataType) => {
  const { stakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => {
      return stakeDataService.getStakeData(marketData);
    },
    queryKey: ['getStkTokens', marketData.marketTitle],
  });
};

export const useUserStakeData = (marketData: MarketDataType, user: string) => {
  const { stakeDataService } = useSharedDependencies();
  return useQuery({
    queryFn: () => {
      return stakeDataService.getUserTakeData(marketData, user);
    },
    queryKey: ['getUserStakeData', marketData.marketTitle, user],
    enabled: !!user,
  });
};

// TODO LINT
export const useStakedDataWithTokenBalances = (userStakeData, chainId, user) => {
  return useQuery({
    queryKey: ['stakedDataWithTokenBalances', chainId, user, userStakeData],
    enabled: !!userStakeData && userStakeData.length > 0,
    queryFn: async () => {
      const provider = getProvider(chainId);
      const multicall = new Multicall({
        ethersProvider: provider,
        tryAggregate: true,
        multicallCustomContractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11', // TODO double check this across all networks
      });

      const tokensToQuery = userStakeData.flatMap((stakeData) => [
        {
          address: stakeData.waTokenUnderlying,
          decimals: 18, // TODO Decimals
        },
        {
          address: stakeData.waTokenAToken,
          decimals: 18, // TODO Decimals
        },
      ]);

      const contractCallContext = tokensToQuery.map((token) => ({
        reference: token.address,
        contractAddress: token.address,
        abi: [
          {
            name: 'balanceOf',
            type: 'function',
            stateMutability: 'view',
            inputs: [{ name: 'account', type: 'address' }],
            outputs: [{ name: 'balance', type: 'uint256' }],
          },
        ],
        calls: [{ reference: 'balanceOfCall', methodName: 'balanceOf', methodParameters: [user] }],
      }));

      const { results } = await multicall.call(contractCallContext);

      // Map balances back to stake data
      const enrichedData = userStakeData.map((stakeData) => {
        const underlyingBalance =
          results[stakeData.waTokenUnderlying]?.callsReturnContext[0]?.returnValues[0];
        const aTokenBalance =
          results[stakeData.waTokenAToken]?.callsReturnContext[0]?.returnValues[0];

        const totalUnderlyingBalance =
          underlyingBalance && aTokenBalance
            ? Number(formatUnits(underlyingBalance, 18)) + Number(formatUnits(aTokenBalance, 18))
            : 0;

        return {
          ...stakeData,
          totalUnderlyingBalance: totalUnderlyingBalance.toString(),
        };
      });

      return enrichedData;
    },
  });
};
