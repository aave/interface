import { API_ETH_MOCK_ADDRESS, ReservesDataHumanized } from '@aave/contract-helpers';
import { nativeToUSD, normalize, USD_DECIMALS } from '@aave/math-utils';
import { fromNano } from '@ton/core';
import axios from 'axios';
import { BigNumber } from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';
import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { MarketDataType, networkConfigs } from 'src/utils/marketsAndNetworksConfig';
import { sleep } from 'src/utils/rotationProvider';

import { usePoolsReservesHumanized } from '../pool/usePoolReserves';
import { usePoolsTokensBalance } from '../pool/usePoolTokensBalance';
import { API_TON_V2 } from './useAppDataProviderTon';

export interface WalletBalance {
  amount: string;
  amountUSD: string;
}

export interface WalletBalancesMap {
  [address: string]: WalletBalance;
}

type FormatAggregatedBalanceParams = {
  reservesHumanized?: ReservesDataHumanized;
  balances?: UserPoolTokensBalances[];
  marketData: MarketDataType;
};

const formatAggregatedBalance = ({
  reservesHumanized,
  balances,
  marketData,
}: FormatAggregatedBalanceParams) => {
  const reserves = reservesHumanized?.reservesData || [];
  const baseCurrencyData = reservesHumanized?.baseCurrencyData || {
    marketReferenceCurrencyDecimals: 0,
    marketReferenceCurrencyPriceInUsd: '0',
    networkBaseTokenPriceInUsd: '0',
    networkBaseTokenPriceDecimals: 0,
  };

  const walletBalances = balances ?? [];
  // process data
  let hasEmptyWallet = true;
  const aggregatedBalance = walletBalances.reduce((acc, reserve) => {
    const poolReserve = reserves.find((poolReserve) => {
      if (reserve.address === API_ETH_MOCK_ADDRESS.toLowerCase()) {
        return (
          poolReserve.symbol.toLowerCase() ===
          networkConfigs[marketData.chainId].wrappedBaseAssetSymbol?.toLowerCase()
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
  }, {} as WalletBalancesMap);
  return {
    walletBalances: aggregatedBalance,
    hasEmptyWallet,
  };
};

export const usePoolsWalletBalances = (marketDatas: MarketDataType[]) => {
  const user = useRootStore((store) => store.account);
  const tokensBalanceQueries = usePoolsTokensBalance(marketDatas, user);
  const poolsBalancesQueries = usePoolsReservesHumanized(marketDatas);
  const isLoading =
    tokensBalanceQueries.some((elem) => elem.isLoading) ||
    poolsBalancesQueries.some((elem) => elem.isLoading);
  const walletBalances = poolsBalancesQueries.map((query, index) =>
    formatAggregatedBalance({
      reservesHumanized: query.data,
      balances: tokensBalanceQueries[index]?.data,
      marketData: marketDatas[index],
    })
  );
  return {
    walletBalances,
    isLoading,
  };
};

export const useTonBalance = (yourWalletTon: string, isConnectedTonWallet: boolean) => {
  // const wallet = useTonWallet();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(true);
  // const client = useTonClient();

  const fetchBalance = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = 50;
    setLoading(true);

    if (!isConnectedTonWallet || !yourWalletTon) {
      setBalance('0');
    }

    const fetchData = async (): Promise<string | undefined> => {
      try {
        if (!yourWalletTon) return;

        const params = {
          address: yourWalletTon,
        };

        const res = await axios.get(`${API_TON_V2}/getAddressInformation`, { params });

        const balance = res.data.result.balance;

        // console.log('apiGetTon-----------------------------------', res);

        const balanceFormatted = fromNano(balance).toString();
        setBalance(balanceFormatted);
        setLoading(false);
        return balanceFormatted;
      } catch (error) {
        attempts += 1;
        setBalance('0');
        console.error(`Error fetchBalance data (Attempt ${attempts}/${maxAttempts}):`, error);
        if (attempts < maxAttempts) {
          await sleep(3000);
          console.log('Retrying...');
          return fetchData();
        } else {
          setLoading(false);
          throw new Error('Max retry attempts reached.');
        }
      }
    };

    try {
      await fetchData();
    } catch (error) {
      console.error('Final error after all attempts:', error);
    }
  }, [isConnectedTonWallet, yourWalletTon]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance, isConnectedTonWallet, yourWalletTon]);

  return { balance, loading, refetch: fetchBalance };
};
export interface WalletBalances {
  walletBalances: WalletBalancesMap;
  hasEmptyWallet: boolean;
  loading: boolean;
  yourWalletBalanceTon?: string;
}

export const useWalletBalances = (marketData: MarketDataType): WalletBalances => {
  const { walletBalances, isLoading } = usePoolsWalletBalances([marketData]);
  return {
    walletBalances: walletBalances[0].walletBalances,
    hasEmptyWallet: walletBalances[0].hasEmptyWallet,
    loading: isLoading,
  };
};
