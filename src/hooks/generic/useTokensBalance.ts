import { formatUnits } from '@ethersproject/units';
import { useQuery } from '@tanstack/react-query';
import { Multicall } from 'ethereum-multicall';
import { queryKeysFactory } from 'src/ui-config/queries';
import { TokenInfo } from 'src/ui-config/TokenList';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export interface TokenInfoWithBalance extends TokenInfo {
  balance: string;
  oracle?: string;
}

export const useTokensBalance = (tokenList: TokenInfo[], chainId: number, user: string) => {
  return useQuery<TokenInfoWithBalance[]>({
    queryKey: queryKeysFactory.tokensBalance(tokenList, chainId, user),
    enabled: tokenList.length > 0,
    queryFn: async () => {
      const provider = getProvider(chainId);
      const tokensWithoutNative = tokenList.filter((elem) => !elem.extensions?.isNative);
      const nativeToken = tokenList.find((token) => token.extensions?.isNative);
      const multicall = new Multicall({
        ethersProvider: provider as unknown as providers.Provider,
        tryAggregate: true,
        multicallCustomContractAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
      });
      const contractCallContext = tokensWithoutNative.map((token) => ({
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

      if (!nativeToken) {
        const { results } = await multicall.call(contractCallContext);
        return tokenList
          .map((elem, index) => {
            const balanceValue = results[index]?.callsReturnContext[0]?.returnValues[0];
            return {
              ...elem,
              balance: balanceValue ? formatUnits(balanceValue, elem.decimals) : '0',
            };
          })
          .sort((a, b) => Number(b.balance) - Number(a.balance));
      }

      const [balanceResult, multicallResult] = await Promise.all([
        provider.getBalance(user),
        multicall.call(contractCallContext),
      ]);

      return tokenList
        .map((elem) => {
          const balanceValue = elem.extensions?.isNative
            ? balanceResult
            : multicallResult.results[elem.address]?.callsReturnContext[0]?.returnValues[0];
          return {
            ...elem,
            balance: balanceValue ? formatUnits(balanceValue, elem.decimals) : '0',
          };
        })
        .sort((a, b) => Number(b.balance) - Number(a.balance));
    },
    onError: (error) => {
      console.error('Error fetching token balances:', error);
    },
  });
};
