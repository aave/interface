import { ReserveDataHumanized } from '@aave/contract-helpers';
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  FormattedGhoReserveData,
  FormattedGhoUserData,
  FormatUserSummaryAndIncentivesResponse,
  formatUserSummaryWithDiscount,
  USD_DECIMALS,
  UserReserveData,
} from '@aave/math-utils';
import { formatUnits } from 'ethers/lib/utils';
import React, { useContext } from 'react';
import { EmodeCategory } from 'src/helpers/types';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { GHO_SUPPORTED_MARKETS, GHO_SYMBOL } from 'src/utils/ghoUtilities';

import { reserveSortFn, selectEmodes } from '../../store/poolSelectors';
import { useGhoPoolFormattedReserve } from '../pool/useGhoPoolFormattedReserve';
import { usePoolFormattedReserves } from '../pool/usePoolFormattedReserves';
import { usePoolReservesHumanized } from '../pool/usePoolReserves';
import { useUserGhoPoolFormattedReserve } from '../pool/useUserGhoPoolFormattedReserve';
import { useUserPoolReservesHumanized } from '../pool/useUserPoolReserves';
import { useUserSummaryAndIncentives } from '../pool/useUserSummaryAndIncentives';
import { useUserYield } from '../pool/useUserYield';

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
  isUserHasDeposits: boolean;
  user: ExtendedFormattedUser;

  marketReferencePriceInUsd: string;
  marketReferenceCurrencyDecimals: number;
  userReserves: UserReserveData[];
  ghoReserveData: FormattedGhoReserveData;
  ghoUserData: FormattedGhoUserData;
  ghoLoadingData: boolean;
}
const AppDataContext = React.createContext<AppDataContextType>({} as AppDataContextType);

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */
export const AppDataProvider: React.FC = ({ children }) => {
  const { currentAccount } = useWeb3Context();
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const currentMarket = useRootStore((state) => state.currentMarket);
  const [eModes] = useRootStore((state) => [selectEmodes(state)]);

  // pool hooks

  const { data: reservesData, isLoading: reservesDataLoading } = usePoolReservesHumanized(currentMarketData);
  const { data: formattedPoolReserves, isLoading: formattedPoolReservesLoading } = usePoolFormattedReserves(currentMarketData);
  const baseCurrencyData = reservesData?.baseCurrencyData;
  const reserves = reservesData?.reservesData;

  // user hooks

  const { data: userReservesData, isLoading: userReservesDataLoading } = useUserPoolReservesHumanized(currentMarketData);
  const { data: userSummary, isLoading: userSummaryLoading } = useUserSummaryAndIncentives(currentMarketData);
  const { data: yields, isLoading: userYieldsLoading } = useUserYield(currentMarketData);
  const userEmodeCategoryId = userReservesData?.userEmodeCategoryId;
  const userReserves = userReservesData?.userReserves;

  // gho hooks
  const { data: formattedGhoUserData } = useUserGhoPoolFormattedReserve(currentMarketData);
  const { data: formattedGhoReserveData, isLoading: ghoReserveDataLoading } =
    useGhoPoolFormattedReserve(currentMarketData);

  // loading
  const isReservesLoading = reservesDataLoading || formattedPoolReservesLoading;
  const isUserDataLoading = userReservesDataLoading || userSummaryLoading || userYieldsLoading;

  let ghoBorrowCap = '0';
  let aaveFacilitatorRemainingCapacity = formattedGhoReserveData
    ? Math.max(formattedGhoReserveData.aaveFacilitatorRemainingCapacity - 0.000001, 0)
    : 0;
  let user = userSummary;
  // Factor discounted GHO interest into cumulative user fields
  if (GHO_SUPPORTED_MARKETS.includes(currentMarket) && reservesData && formattedGhoUserData) {
    const baseCurrencyData = reservesData.baseCurrencyData;
    const reserves = reservesData.reservesData;
    ghoBorrowCap = reserves.find((r) => r.symbol === GHO_SYMBOL)?.borrowCap || '0';

    if (ghoBorrowCap && ghoBorrowCap !== '0') {
      aaveFacilitatorRemainingCapacity = Number(ghoBorrowCap);
    }

    if (formattedGhoUserData.userDiscountedGhoInterest > 0 && user) {
      const userSummaryWithDiscount = formatUserSummaryWithDiscount({
        userGhoDiscountedInterest: formattedGhoUserData.userDiscountedGhoInterest,
        user,
        marketReferenceCurrencyPriceUSD: Number(
          formatUnits(baseCurrencyData.marketReferenceCurrencyPriceInUsd, USD_DECIMALS)
        ),
      });
      user = {
        ...user,
        ...userSummaryWithDiscount,
      };
    }
  }

  const isUserHasDeposits = user
    ? user.userReservesData.some((userReserve) => userReserve.scaledATokenBalance !== '0')
    : false;

  return (
    <AppDataContext.Provider
      value={{
        loading: isReservesLoading || (!!currentAccount && isUserDataLoading),
        reserves: formattedPoolReserves,
        eModes,
        user: {
          ...user,
          totalBorrowsUSD: user?.totalBorrowsUSD,
          totalBorrowsMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
          userEmodeCategoryId,
          isInEmode: userEmodeCategoryId !== 0,
          userReservesData: user.userReservesData.sort((a, b) =>
            reserveSortFn(a.reserve, b.reserve)
          ),
          earnedAPY: yields?.earnedAPY || 0,
          debtAPY: yields?.debtAPY || 0,
          netAPY: yields?.netAPY || 0,
        },
        userReserves,
        isUserHasDeposits,
        marketReferencePriceInUsd: baseCurrencyData?.marketReferenceCurrencyPriceInUsd || '0',
        marketReferenceCurrencyDecimals: baseCurrencyData?.marketReferenceCurrencyDecimals || 0,
        // TODO: we should consider removing this from the context and use zustand instead. If we had a selector that would return the formatted gho data, I think that
        // would work out pretty well. We could even extend that pattern for the other reserves, and migrate towards the global store instead of the app data provider.
        // ghoLoadingData for now is just propagated through to reduce changes to other components.
        ghoReserveData: {
          ...formattedGhoReserveData,
          aaveFacilitatorRemainingCapacity,
        },
        ghoUserData: formattedGhoUserData,
        ghoLoadingData: ghoReserveDataLoading,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => useContext(AppDataContext);
