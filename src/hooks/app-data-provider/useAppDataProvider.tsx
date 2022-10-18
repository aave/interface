import { ReserveDataHumanized } from '@aave/contract-helpers';
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
  FormatUserSummaryAndIncentivesResponse,
  UserReserveData,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import React, { useContext } from 'react';
import { EmodeCategory } from 'src/helpers/types';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import {
  reserveSortFn,
  selectCurrentBaseCurrencyData,
  selectCurrentReserves,
  selectCurrentUserEmodeCategoryId,
  selectCurrentUserReserves,
  selectEmodes,
} from '../../store/poolSelectors';
import { useCurrentTimestamp } from '../useCurrentTimestamp';
import { useProtocolDataContext } from '../useProtocolDataContext';

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
  // refreshPoolData?: () => Promise<void[]>;
  isUserHasDeposits: boolean;
  user: ExtendedFormattedUser;
  // refreshIncentives?: () => Promise<void>;
  // loading: boolean;

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
  const { currentNetworkConfig } = useProtocolDataContext();
  const [
    reserves,
    baseCurrencyData,
    userReserves,
    userEmodeCategoryId,
    reserveIncentiveData,
    userIncentiveData,
    eModes,
  ] = useRootStore((state) => [
    selectCurrentReserves(state),
    selectCurrentBaseCurrencyData(state),
    selectCurrentUserReserves(state),
    selectCurrentUserEmodeCategoryId(state),
    state.reserveIncentiveData,
    state.userIncentiveData,
    selectEmodes(state),
  ]);

  const formattedPoolReserves = formatReservesAndIncentives({
    reserves,
    currentTimestamp,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    reserveIncentives: reserveIncentiveData || [],
  })
    .map((r) => ({
      ...r,
      ...fetchIconSymbolAndName(r),
      isEmodeEnabled: r.eModeCategoryId !== 0,
      isWrappedBaseAsset:
        r.symbol.toLowerCase() === currentNetworkConfig.wrappedBaseAssetSymbol?.toLowerCase(),
    }))
    .sort(reserveSortFn);

  const user = formatUserSummaryAndIncentives({
    currentTimestamp,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves,
    formattedReserves: formattedPoolReserves,
    userEmodeCategoryId: userEmodeCategoryId,
    reserveIncentives: reserveIncentiveData || [],
    userIncentives: userIncentiveData || [],
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
          userEmodeCategoryId,
          isInEmode: userEmodeCategoryId !== 0,
          userReservesData: user.userReservesData.sort((a, b) =>
            reserveSortFn(a.reserve, b.reserve)
          ),
          earnedAPY,
          debtAPY,
          netAPY,
        },
        userReserves,
        isUserHasDeposits,
        marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => useContext(AppDataContext);
