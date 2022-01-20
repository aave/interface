import {
  API_ETH_MOCK_ADDRESS,
  ReserveDataHumanized,
  WalletBalanceProvider,
} from '@aave/contract-helpers';
import {
  FormatUserSummaryAndIncentivesResponse,
  UserReserveData,
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
  nativeToUSD,
  normalize,
} from '@aave/math-utils';
import React, { useContext, useEffect, useState } from 'react';
import {
  useC_ProtocolDataQuery,
  useC_ReservesIncentivesQuery,
  useC_UserDataQuery,
  useC_UserIncentivesQuery,
} from './graphql/hooks';

import BigNumber from 'bignumber.js';
import { useCurrentTimestamp } from '../useCurrentTimestamp';
import { useIncentiveData } from './useIncentiveData';
import { usePolling } from '../usePolling';
import { usePoolData } from './usePoolData';
import { useProtocolDataContext } from '../useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

/**
 * removes the marketPrefix from a symbol
 * @param symbol
 * @param prefix
 */
export const unPrefixSymbol = (symbol: string, prefix: string) => {
  return symbol.toUpperCase().replace(RegExp(`^(${prefix[0]}?${prefix.slice(1)})`), '');
};

const useWalletBalances = (skip = false) => {
  const { currentAccount } = useWeb3Context();
  const { currentMarketData, jsonRpcProvider } = useProtocolDataContext();
  const [walletBalances, setWalletBalances] = useState<{
    [address: Lowercase<string>]: string;
  }>({});

  const fetchWalletData = async () => {
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
    const cleanBalances = tokenAddresses.reduce((acc, reserve, i) => {
      acc[reserve.toLowerCase()] = balances[i].toString();
      return acc;
    }, {} as { [address: Lowercase<string>]: string });
    setWalletBalances(cleanBalances);
  };

  usePolling(fetchWalletData, 30000, !currentAccount || skip, [
    currentAccount,
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
  ]);

  // reset balances on disconnect
  useEffect(() => {
    if (!currentAccount) setWalletBalances({});
  }, [currentAccount]);

  return { walletBalances, refetch: fetchWalletData };
};

export type ComputedReserveData = ReturnType<typeof formatReservesAndIncentives>[0] &
  ReserveDataHumanized;

export interface AppDataContextType {
  reserves: ComputedReserveData[];
  // refreshPoolData?: () => Promise<void[]>;
  walletBalances: { [address: string]: { amount: string; amountUSD: string } };
  hasEmptyWallet: boolean;
  refetchWalletData: () => Promise<void>;
  isUserHasDeposits: boolean;
  user?: FormatUserSummaryAndIncentivesResponse & { earnedAPY: number; debtAPY: number };
  userId: string;
  // refreshIncentives?: () => Promise<void>;
  // loading: boolean;

  marketReferencePriceInUsd: string;
  marketReferenceCurrencyDecimals: number;
  userEmodeCategoryId: number;
  userReserves: UserReserveData[];
}

const AppDataContext = React.createContext<AppDataContextType>({} as AppDataContextType);

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */
export const AppDataProvider: React.FC = ({ children }) => {
  const currentTimestamp = useCurrentTimestamp(1);
  const { currentAccount } = useWeb3Context();
  const { currentNetworkConfig, currentMarketData } = useProtocolDataContext();
  // just populates the cache
  useIncentiveData();
  usePoolData();
  const { data: reservesData } = useC_ProtocolDataQuery({
    variables: {
      lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    },
    fetchPolicy: 'cache-only',
  });

  const { data: userReservesData } = useC_UserDataQuery({
    variables: {
      lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      userAddress: currentAccount,
    },
    fetchPolicy: 'cache-only',
  });

  const reserves: ReserveDataHumanized[] = reservesData?.protocolData.reserves || [];
  const baseCurrencyData = reservesData?.protocolData.baseCurrencyData || {
    marketReferenceCurrencyDecimals: 0,
    marketReferenceCurrencyPriceInUsd: '0',
    networkBaseTokenPriceInUsd: '0',
    networkBaseTokenPriceDecimals: 0,
  };
  const { data: reservesIncentivesData } = useC_ReservesIncentivesQuery({
    variables: {
      lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
    },
    fetchPolicy: 'cache-only',
  });
  const { data: userReservesIncentivesData } = useC_UserIncentivesQuery({
    variables: {
      lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
      userAddress: currentAccount,
    },
    fetchPolicy: 'cache-only',
  });
  let hasEmptyWallet = true;
  const { walletBalances, refetch: refetchWalletData } = useWalletBalances();

  const aggregatedBalance = Object.keys(walletBalances).reduce((acc, reserve) => {
    const poolReserve = reserves.find((poolReserve) => {
      if (reserve.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase()) {
        return (
          poolReserve.symbol.toLowerCase() ===
          currentNetworkConfig.wrappedBaseAssetSymbol?.toLowerCase()
        );
      }
      return poolReserve.underlyingAsset.toLowerCase() === reserve.toLowerCase();
    });
    if (walletBalances[reserve] !== '0') hasEmptyWallet = false;
    if (poolReserve) {
      acc[reserve.toLowerCase()] = {
        amount: normalize(walletBalances[reserve], poolReserve.decimals),
        amountUSD: nativeToUSD({
          amount: new BigNumber(walletBalances[reserve]),
          currencyDecimals: poolReserve.decimals,
          priceInMarketReferenceCurrency: poolReserve.priceInMarketReferenceCurrency,
          marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
          normalizedMarketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        }),
      };
    }
    return acc;
  }, {} as { [address: string]: { amount: string; amountUSD: string } });

  console.log(reservesIncentivesData?.reservesIncentives);

  const formattedPoolReserves = formatReservesAndIncentives({
    reserves,
    currentTimestamp,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    reserveIncentives: reservesIncentivesData?.reservesIncentives || [],
  });

  const userReserves: UserReserveData[] = [];
  if (userReservesData?.userData && reserves.length) {
    userReservesData?.userData.userReserves.forEach((rawUserReserve) => {
      const reserve = reserves.find(
        (r) => r.underlyingAsset.toLowerCase() === rawUserReserve.underlyingAsset.toLowerCase()
      );
      if (reserve) {
        userReserves.push({
          ...rawUserReserve,
          reserve,
        });
      }
    });
  }

  const userEmodeCategoryId = userReservesData?.userData.userEmodeCategoryId || 0;

  const user: FormatUserSummaryAndIncentivesResponse = formatUserSummaryAndIncentives({
    currentTimestamp,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves,
    userEmodeCategoryId: userEmodeCategoryId,
    reserveIncentives: reservesIncentivesData?.reservesIncentives || [],
    userIncentives: userReservesIncentivesData?.userIncentives || [],
  });

  const proportions = user.userReservesData.reduce(
    (acc, value) => {
      const reserve = formattedPoolReserves.find(
        (r) => r.underlyingAsset === value.reserve.underlyingAsset
      );

      if (reserve) {
        if (value.underlyingBalanceUSD !== '0') {
          acc.positiveProportion = acc.positiveProportion.plus(
            new BigNumber(reserve.supplyAPY).multipliedBy(value.underlyingBalanceUSD)
          );
          if (reserve.aIncentivesData) {
            reserve.aIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(value.underlyingBalanceUSD)
              );
            });
          }
        }
        if (value.variableBorrowsUSD !== '0') {
          acc.negativeProportion = acc.negativeProportion.plus(
            new BigNumber(reserve.variableBorrowAPY).multipliedBy(value.variableBorrowsUSD)
          );
          if (reserve.vIncentivesData) {
            reserve.vIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(value.variableBorrowsUSD)
              );
            });
          }
        }
        if (value.stableBorrowsUSD !== '0') {
          acc.negativeProportion = acc.negativeProportion.plus(
            new BigNumber(value.stableBorrowAPY).multipliedBy(value.stableBorrowsUSD)
          );
          if (reserve.sIncentivesData) {
            reserve.sIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(value.stableBorrowsUSD)
              );
            });
          }
        }
      } else {
        throw new Error('no possible to calculate net apy');
      }

      return acc;
    },
    {
      positiveProportion: new BigNumber(0),
      negativeProportion: new BigNumber(0),
    }
  );

  const isUserHasDeposits = user.userReservesData.some(
    (userReserve) => userReserve.scaledATokenBalance !== '0'
  );

  return (
    <AppDataContext.Provider
      value={{
        walletBalances: aggregatedBalance,
        hasEmptyWallet,
        reserves: formattedPoolReserves,
        user: {
          ...user,
          earnedAPY: proportions.positiveProportion
            .dividedBy(user.netWorthUSD)
            .multipliedBy(100)
            .toNumber(),
          debtAPY: proportions.negativeProportion
            .dividedBy(user.netWorthUSD)
            .multipliedBy(100)
            .toNumber(),
        },
        userReserves,
        userId: currentAccount,
        isUserHasDeposits,
        refetchWalletData,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
        userEmodeCategoryId,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => useContext(AppDataContext);
