import { WalletBalanceProvider } from '@aave/contract-helpers';
import { useApolloClient, useQuery } from '@apollo/client';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { usePolling } from '../usePolling';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { gql } from 'graphql-tag';
import { useCallback } from 'react';

const WalletBalancesQuery = gql`
  query WalletBalances($currentAccount: String!, $chainId: Int!) {
    walletBalances(currentAccount: $currentAccount, chainId: $chainId) {
      id @client
      amount @client
    }
  }
`;

export const useWalletBalances = (currentAccount: string, chainId: number) => {
  const { data } = useQuery<{ walletBalances: { id: string; amount: string }[] }>(
    WalletBalancesQuery,
    {
      variables: {
        currentAccount,
        chainId,
      },
      fetchPolicy: 'cache-only',
    }
  );
  return [data?.walletBalances || []];
};

export const useUpdateWalletBalances = () => {
  const { currentAccount } = useWeb3Context();
  const { cache } = useApolloClient();
  const { currentMarketData, jsonRpcProvider, currentChainId } = useProtocolDataContext();

  const fetchWalletData = useCallback(async () => {
    if (!currentAccount) return;
    const contract = new WalletBalanceProvider({
      walletBalanceProviderAddress: currentMarketData.addresses.WALLET_BALANCE_PROVIDER,
      provider: jsonRpcProvider,
    });
    const { 0: tokenAddresses, 1: balances } =
      await contract.getUserWalletBalancesForLendingPoolProvider(
        currentAccount,
        currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
      );
    cache.writeQuery({
      query: WalletBalancesQuery,
      data: {
        __typename: 'WalletBalances',
        walletBalances: tokenAddresses.map((address, ix) => ({
          __typename: 'WalletBalance',
          id: address.toLowerCase(),
          amount: balances[ix].toString(),
          amountUSD: 'test',
        })),
      },
      variables: {
        currentAccount,
        chainId: currentChainId,
      },
    });
  }, []);

  usePolling(fetchWalletData, 30000, !currentAccount, [
    currentAccount,
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
  ]);

  return { refetch: fetchWalletData };
};
