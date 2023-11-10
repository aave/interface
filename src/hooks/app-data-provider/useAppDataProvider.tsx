import { ReserveDataHumanized } from '@aave/contract-helpers';
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  FormattedGhoReserveData,
  FormattedGhoUserData,
  formatUserSummaryWithDiscount,
  USD_DECIMALS,
  UserReserveData,
} from '@aave/math-utils';
import { formatUnits } from 'ethers/lib/utils';
import React, { useContext } from 'react';
import { EmodeCategory } from 'src/helpers/types';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { GHO_SUPPORTED_MARKETS } from 'src/utils/ghoUtilities';

import { formatEmodes } from '../../store/poolSelectors';
import {
  ExtendedFormattedUser,
  useExtendedUserSummaryAndIncentives,
} from '../pool/useExtendedUserSummaryAndIncentives';
import { useGhoPoolFormattedReserve } from '../pool/useGhoPoolFormattedReserve';
import { usePoolFormattedReserves } from '../pool/usePoolFormattedReserves';
import { usePoolReservesHumanized } from '../pool/usePoolReserves';
import { useUserGhoPoolFormattedReserve } from '../pool/useUserGhoPoolFormattedReserve';
import { useUserPoolReservesHumanized } from '../pool/useUserPoolReserves';

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

export interface AppDataContextType {
  loading: boolean;
  reserves: ComputedReserveData[];
  eModes: Record<number, EmodeCategory>;
  isUserHasDeposits: boolean;
  user?: ExtendedFormattedUser;

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
  // pool hooks

  const { data: reservesData, isLoading: reservesDataLoading } =
    usePoolReservesHumanized(currentMarketData);
  const { data: formattedPoolReserves, isLoading: formattedPoolReservesLoading } =
    usePoolFormattedReserves(currentMarketData);
  const baseCurrencyData = reservesData?.baseCurrencyData;
  // user hooks

  const eModes = reservesData?.reservesData ? formatEmodes(reservesData.reservesData) : {};

  const { data: userReservesData, isLoading: userReservesDataLoading } =
    useUserPoolReservesHumanized(currentMarketData);
  const { data: userSummary, isLoading: userSummaryLoading } =
    useExtendedUserSummaryAndIncentives(currentMarketData);
  const userReserves = userReservesData?.userReserves;

  // gho hooks
  const { data: formattedGhoUserData, isLoading: isGhoUserDataLoading } =
    useUserGhoPoolFormattedReserve(currentMarketData);
  const { data: formattedGhoReserveData, isLoading: ghoReserveDataLoading } =
    useGhoPoolFormattedReserve(currentMarketData);

  const formattedGhoReserveDataWithDefault = formattedGhoReserveData || {
    aaveFacilitatorRemainingCapacity: 0,
    aaveFacilitatorMintedPercent: 0,
    aaveFacilitatorBucketLevel: 0,
    aaveFacilitatorBucketMaxCapacity: 0,
    ghoBorrowAPYWithMaxDiscount: 0,
    ghoBaseVariableBorrowRate: 0,
    ghoVariableBorrowAPY: 0,
    ghoDiscountedPerToken: 0,
    ghoDiscountRate: 0,
    ghoMinDebtTokenBalanceForDiscount: 0,
    ghoMinDiscountTokenBalanceForDiscount: 0,
  };

  const formattedGhoUserDataWithDefault = formattedGhoUserData || {
    userGhoDiscountPercent: 0,
    userDiscountTokenBalance: 0,
    userGhoBorrowBalance: 0,
    userDiscountedGhoInterest: 0,
    userGhoAvailableToBorrowAtDiscount: 0,
  };

  // loading
  const isReservesLoading = reservesDataLoading || formattedPoolReservesLoading;
  const isUserDataLoading = userReservesDataLoading || userSummaryLoading;

  let user = userSummary;
  // Factor discounted GHO interest into cumulative user fields

  const isGhoInMarket = GHO_SUPPORTED_MARKETS.includes(currentMarket);

  if (isGhoInMarket && reservesData && formattedGhoUserData) {
    const baseCurrencyData = reservesData.baseCurrencyData;
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
        reserves: formattedPoolReserves || [],
        eModes,
        user,
        userReserves: userReserves || [],
        isUserHasDeposits,
        marketReferencePriceInUsd: baseCurrencyData?.marketReferenceCurrencyPriceInUsd || '0',
        marketReferenceCurrencyDecimals: baseCurrencyData?.marketReferenceCurrencyDecimals || 0,
        // TODO: we should consider removing this from the context and use zustand instead. If we had a selector that would return the formatted gho data, I think that
        // would work out pretty well. We could even extend that pattern for the other reserves, and migrate towards the global store instead of the app data provider.
        // ghoLoadingData for now is just propagated through to reduce changes to other components.
        ghoReserveData: formattedGhoReserveDataWithDefault,
        ghoUserData: formattedGhoUserDataWithDefault,
        ghoLoadingData: ghoReserveDataLoading || (!!currentAccount && isGhoUserDataLoading),
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => useContext(AppDataContext);
