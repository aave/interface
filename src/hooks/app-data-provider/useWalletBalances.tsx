import { API_ETH_MOCK_ADDRESS, WalletBalanceProvider } from '@aave/contract-helpers';
import { nativeToUSD, normalize, USD_DECIMALS } from '@aave/math-utils';
import { useApolloClient, useQuery } from '@apollo/client';
import { BigNumber } from 'bignumber.js';
import { gql } from 'graphql-tag';
import { useCallback } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { usePolling } from '../usePolling';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { useC_ProtocolDataQuery } from './graphql/hooks';

export interface WalletBalance {
  id: string;
  address: string;
  amount: string;
}

const WalletBalancesQuery = gql`
  query WalletBalances($currentAccount: String!, $chainId: Int!) {
    walletBalances(currentAccount: $currentAccount, chainId: $chainId) {
      id @client
      address @client
      amount @client
    }
  }
`;

// allow fetching single wallet balance
// export const useWalletBalance = (chainId: number, address = '') => {
//   const { cache } = useApolloClient();
//   const balance = cache.readFragment<WalletBalance>({
//     id: `WalletBalance:${chainId}_${address.toLowerCase()}`,
//     fragment: gql`
//       fragment Balance on WalletBalance {
//         id @client
//         address @client
//         amount @client
//       }
//     `,
//   });
//   return balance;
// };

export const useWalletBalances = () => {
  const { currentAccount } = useWeb3Context();
  const { currentMarketData, currentChainId, currentNetworkConfig } = useProtocolDataContext();

  // fetch unformatted reserve data for prices
  const { data: reservesData } = useC_ProtocolDataQuery({
    variables: {
      lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      chainId: currentChainId,
    },
    fetchPolicy: 'cache-only',
  });
  // fetch unformatted wallet balances
  const { data: balances } = useQuery<{
    walletBalances: WalletBalance[];
  }>(WalletBalancesQuery, {
    variables: {
      currentAccount,
      chainId: currentChainId,
    },
    fetchPolicy: 'cache-only',
  });

  // process data
  const walletBalances = balances?.walletBalances || [];
  const reserves = reservesData?.protocolData.reserves || [];
  const baseCurrencyData = reservesData?.protocolData.baseCurrencyData || {
    marketReferenceCurrencyDecimals: 0,
    marketReferenceCurrencyPriceInUsd: '0',
    networkBaseTokenPriceInUsd: '0',
    networkBaseTokenPriceDecimals: 0,
  };
  let hasEmptyWallet = true;
  const aggregatedBalance = walletBalances.reduce((acc, reserve) => {
    const poolReserve = reserves.find((poolReserve) => {
      if (reserve.address === API_ETH_MOCK_ADDRESS.toLowerCase()) {
        return (
          poolReserve.symbol.toLowerCase() ===
          currentNetworkConfig.wrappedBaseAssetSymbol?.toLowerCase()
        );
      }
      return poolReserve.underlyingAsset.toLowerCase() === reserve.address;
    });
    if (reserve.amount !== '0') hasEmptyWallet = false;
    if (poolReserve) {
      acc[reserve.address] = {
        amount: normalize(reserve.amount, poolReserve.decimals),
        amountUSD: nativeToUSD({
          amount: new BigNumber(reserve.amount),
          currencyDecimals: poolReserve.decimals,
          priceInMarketReferenceCurrency: poolReserve.priceInMarketReferenceCurrency,
          marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
          normalizedMarketReferencePriceInUsd: normalize(
            baseCurrencyData.marketReferenceCurrencyPriceInUsd,
            USD_DECIMALS
          ),
        }),
      };
    }
    return acc;
  }, {} as { [address: string]: { amount: string; amountUSD: string } });
  return {
    walletBalances: aggregatedBalance,
    hasEmptyWallet,
    loading: !walletBalances.length || !reserves.length,
  };
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
          id: `${currentChainId}_${address.toLowerCase()}`,
          address: address.toLowerCase(),
          amount: balances[ix].toString(),
        })) as WalletBalance[],
      },
      variables: {
        currentAccount,
        chainId: currentChainId,
      },
    });
  }, [currentChainId, currentAccount, currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER]);

  usePolling(fetchWalletData, 30000, !currentAccount, [
    currentAccount,
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    currentChainId,
  ]);

  return { refetch: fetchWalletData };
};
