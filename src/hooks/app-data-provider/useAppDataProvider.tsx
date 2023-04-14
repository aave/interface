import { ReserveDataHumanized } from '@aave/contract-helpers';
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  FormatUserSummaryAndIncentivesResponse,
  UserReserveData,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import React, { useContext } from 'react';
import { EmodeCategory } from 'src/helpers/types';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import {
  formatEmodes,
  formatReserves,
  formatUserSummaryAndIncentives,
  reserveSortFn,
} from '../../store/poolSelectors';
import { useReserveIncentiveData } from '../incentive/useReserveIncentiveData';
import { useUserIncentiveData } from '../incentive/useUserIncentiveData';
import { usePoolReserves } from '../pool/usePoolReserves';
import { useUserPoolReserves } from '../pool/useUserPoolReserves';
import { useCurrentTimestamp } from '../useCurrentTimestamp';

/**
 * removes the marketPrefix from a symbol
 * @param symbol
 * @param prefix
 */
export const unPrefixSymbol = (symbol: string, prefix: string) => {
  return symbol.toUpperCase().replace(RegExp(`^(${prefix[0]}?${prefix.slice(1)})`), '');
};

export type ComputedReserveData = ReturnType<typeof formatReservesAndIncentives>[0] &
  ReserveDataHumanized & {
    iconSymbol: string;
    isEmodeEnabled: boolean;
    isWrappedBaseAsset: boolean;
  };

export type ComputedUserReserveData = ComputedUserReserve<ComputedReserveData>;

export type ExtendedFormattedUser = FormatUserSummaryAndIncentivesResponse<ComputedReserveData> & {
  earnedAPY: number;
  debtAPY: number;
  netAPY: number;
  isInEmode: boolean;
  userEmodeCategoryId: number;
};

export interface AppDataContextType {
  loading: boolean;
  reserves: ComputedReserveData[];
  eModes: Record<number, EmodeCategory>;
  user: ExtendedFormattedUser;
  marketReferencePriceInUsd: string;
  marketReferenceCurrencyDecimals: number;
  userReserves: UserReserveData[];
}

const AppDataContext = React.createContext<AppDataContextType>({} as AppDataContextType);

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */
export const AppDataProvider: React.FC = ({ children }) => {
  const currentTimestamp = useCurrentTimestamp(5);
  const { currentAccount } = useWeb3Context();

  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const account = useRootStore((store) => store.account);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);

  const { data: userPoolReserves } = useUserPoolReserves({
    user: account,
    lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
  });
  const { data: poolReserves } = usePoolReserves({
    lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
  });
  const { data: reservesIncentives } = useReserveIncentiveData({
    lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
  });
  const { data: userIncentiveData } = useUserIncentiveData({
    user: account,
    lendingPoolAddressProvider: currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
  });

  const userEmodeCategoryId = userPoolReserves?.userEmodeCategoryId || 0;
  const userReserves = userPoolReserves?.userReserves || [];
  const reserves = poolReserves?.reservesData || [];
  const baseCurrencyData = poolReserves?.baseCurrencyData || {
    marketReferenceCurrencyDecimals: 0,
    marketReferenceCurrencyPriceInUsd: '0',
    networkBaseTokenPriceInUsd: '0',
    networkBaseTokenPriceDecimals: 0,
  };
  const formattedPoolReserves = formatReserves(
    reserves,
    baseCurrencyData,
    currentNetworkConfig,
    currentTimestamp,
    reservesIncentives ?? []
  );
  const user = formatUserSummaryAndIncentives(
    currentTimestamp,
    baseCurrencyData,
    userReserves,
    formattedPoolReserves,
    userIncentiveData ?? [],
    userEmodeCategoryId,
    reservesIncentives ?? []
  );
  const eModes = formatEmodes(reserves ?? []);

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

  const earnedAPY = proportions.positiveProportion.dividedBy(user.totalLiquidityUSD).toNumber();
  const debtAPY = proportions.negativeProportion.dividedBy(user.totalBorrowsUSD).toNumber();
  const netAPY =
    (earnedAPY || 0) *
      (Number(user.totalLiquidityUSD) / Number(user.netWorthUSD !== '0' ? user.netWorthUSD : '1')) -
    (debtAPY || 0) *
      (Number(user.totalBorrowsUSD) / Number(user.netWorthUSD !== '0' ? user.netWorthUSD : '1'));

  return (
    <AppDataContext.Provider
      value={{
        loading: !reserves.length || (!!currentAccount && userReserves === undefined),
        reserves: formattedPoolReserves,
        eModes,
        user: {
          ...user,
          userEmodeCategoryId: userEmodeCategoryId || 0,
          isInEmode: userEmodeCategoryId !== 0,
          userReservesData: user.userReservesData.sort((a, b) =>
            reserveSortFn(a.reserve, b.reserve)
          ),
          earnedAPY,
          debtAPY,
          netAPY,
        },
        userReserves,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => useContext(AppDataContext);
