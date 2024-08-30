import { API_ETH_MOCK_ADDRESS, ReservesDataHumanized } from '@aave/contract-helpers';
import { nativeToUSD, normalize, USD_DECIMALS } from '@aave/math-utils';
import { fromNano } from '@ton/core';
import { WalletContractV4 } from '@ton/ton';
import { useTonWallet } from '@tonconnect/ui-react';
import { BigNumber } from 'bignumber.js';
import { useCallback, useEffect, useState } from 'react';
import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { useRootStore } from 'src/store/root';
import { MarketDataType, networkConfigs } from 'src/utils/marketsAndNetworksConfig';

import { usePoolsReservesHumanized } from '../pool/usePoolReserves';
import { usePoolsTokensBalance } from '../pool/usePoolTokensBalance';
import { useTonClient } from '../useTonClient';
import { MAX_ATTEMPTS } from './useAppDataProviderTon';

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

export const useTonBalance = () => {
  const wallet = useTonWallet();
  const [balance, setBalance] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const client = useTonClient();

  const fetchBalance = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = MAX_ATTEMPTS;
    setLoading(true);
    const fetchData = async () => {
      try {
        attempts++;
        if (!client || !wallet || !wallet?.account?.publicKey) return setBalance('');
        const workchain = 0; // Usually you need a workchain 0
        const publicKey = Buffer.from(wallet.account.publicKey, 'hex');

        // // Generate new key
        // const mnemonics = await mnemonicNew();
        // const keyPair = await mnemonicToPrivateKey(mnemonics);

        const walletContract = WalletContractV4.create({ workchain, publicKey: publicKey });

        const walletInstance = client.open(walletContract);

        const balance: bigint = await walletInstance.getBalance();

        setBalance(fromNano(balance).toString());
      } catch (error) {
        console.error(`Error fetching balance TON (attempt ${attempts}):`, error);
        if (attempts < maxAttempts) {
          console.log('Retrying... balance TON');
          await fetchData();
        } else {
          console.log('Max attempts reached, stopping retries.');
          setBalance('');
        }
      } finally {
        if (attempts >= maxAttempts || (attempts < maxAttempts && !balance)) {
          setLoading(false);
        }
      }
    };

    await fetchData();
  }, [balance, client, wallet]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

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
