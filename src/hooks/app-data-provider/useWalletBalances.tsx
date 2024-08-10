import { API_ETH_MOCK_ADDRESS, ReservesDataHumanized } from '@aave/contract-helpers';
import { nativeToUSD, normalize, USD_DECIMALS } from '@aave/math-utils';
import { Address, fromNano } from '@ton/core';
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

export const useTonBalance = (walletAddress: string) => {
  const wallet = useTonWallet();
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const client = useTonClient();

  const fetchBalance = useCallback(async () => {
    if (!client || !walletAddress || !wallet || !wallet?.account?.publicKey) return;

    setLoading(true);
    setError(null);

    try {
      const address = Address.parse(walletAddress);
      const workchain = 0; // Usually you need a workchain 0

      const publicKey = Buffer.from(wallet.account.publicKey, 'hex');
      const walletContract = WalletContractV4.create({ workchain, publicKey: publicKey });

      const walletInstance = client.open(walletContract);

      const balance: bigint = await walletInstance.getBalance();
      console.log(
        'Current deployment wallet balance --------------------- = ',
        fromNano(balance).toString(),
        '💎TON',
        wallet?.account?.publicKey
      );
      const seqno: number = await walletInstance.getSeqno();
      const account = await client.getAccount(seqno, address);
      console.log('--------------------------', account);

      setBalance(fromNano(balance).toString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [client, wallet, walletAddress]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
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
