import type {
  EmodeMarketCategory,
  Market,
  MarketUserReserveBorrowPosition,
  MarketUserReserveSupplyPosition,
  MarketUserState,
  PercentValue,
  Reserve,
  TokenAmount,
} from '@aave/graphql';
import { UserReserveData } from '@aave/math-utils';
import { client } from 'pages/_app.page';
import React, { PropsWithChildren, useContext } from 'react';
import { EmodeCategory } from 'src/helpers/types';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { formatEmodes } from '../../store/poolSelectors';
import {
  ExtendedFormattedUser as _ExtendedFormattedUser,
  useExtendedUserSummaryAndIncentives,
} from '../pool/useExtendedUserSummaryAndIncentives';
import {
  FormattedReservesAndIncentives,
  usePoolFormattedReserves,
} from '../pool/usePoolFormattedReserves';
import { usePoolReservesHumanized } from '../pool/usePoolReserves';
import { useUserPoolReservesHumanized } from '../pool/useUserPoolReserves';
import { FormattedUserReserves } from '../pool/useUserSummaryAndIncentives';
import { useMarketsData } from './useMarketsData';
import { useUserBorrows } from './useUserBorrows';
import { useUserSupplies } from './useUserSupplies';

/**
 * removes the marketPrefix from a symbol
 * @param symbol
 * @param prefix
 */
export const unPrefixSymbol = (symbol: string, prefix: string) => {
  return symbol.toUpperCase().replace(RegExp(`^(${prefix[0]}?${prefix.slice(1)})`), '');
};

/**
 * @deprecated Use FormattedReservesAndIncentives type from usePoolFormattedReserves hook
 */
export type ComputedReserveData = FormattedReservesAndIncentives;

/**
 * @deprecated Use FormattedUserReserves type from useUserSummaryAndIncentives hook
 */
export type ComputedUserReserveData = FormattedUserReserves;

/**
 * @deprecated Use ExtendedFormattedUser type from useExtendedUserSummaryAndIncentives hook
 */
export type ExtendedFormattedUser = _ExtendedFormattedUser;
export type ReserveWithId = Reserve & {
  id: string;
  supplyAPY?: number;
  borrowAPY?: number;
  underlyingBalance?: string;
  usageAsCollateralEnabledOnUser?: boolean;
  isCollateralPosition?: boolean;
  apyPosition?: PercentValue;
  balancePosition?: TokenAmount;
};
export interface AppDataContextType {
  loading: boolean;
  /** SDK market snapshot */
  market?: Market;
  totalBorrows?: number;
  supplyReserves: ReserveWithId[];
  borrowReserves: ReserveWithId[];
  eModeCategories: EmodeMarketCategory[];
  userState?: MarketUserState;
  userSupplies?: MarketUserReserveSupplyPosition[];
  userBorrows?: MarketUserReserveBorrowPosition[];
  /** Legacy fields (deprecated) kept temporarily for incremental migration */
  reserves: ComputedReserveData[];
  eModes: Record<number, EmodeCategory>;
  user?: ExtendedFormattedUser;
  marketReferencePriceInUsd: string;
  marketReferenceCurrencyDecimals: number;
  userReserves: UserReserveData[];
}

const AppDataContext = React.createContext<AppDataContextType>({} as AppDataContextType);

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */
export const AppDataProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { currentAccount } = useWeb3Context();

  const currentMarketData = useRootStore((state) => state.currentMarketData);

  const { data, isPending } = useMarketsData({
    client,
    marketData: currentMarketData,
    account: currentAccount,
  });

  const { data: userSuppliesData, isPending: userSuppliesLoading } = useUserSupplies({
    client,
    marketData: currentMarketData,
    account: currentAccount,
  });

  const { data: userBorrowsData, isPending: userBorrowsLoading } = useUserBorrows({
    client,
    marketData: currentMarketData,
    account: currentAccount,
  });

  const marketAddress = currentMarketData.addresses.LENDING_POOL.toLowerCase();

  const sdkMarket = data?.find((item) => item.address.toLowerCase() === marketAddress);

  const totalBorrows = sdkMarket?.borrowReserves.reduce((acc, reserve) => {
    const value = reserve.borrowInfo?.total?.usd ?? 0;
    return acc + Number(value);
  }, 0);

  const supplyReserves = (sdkMarket?.supplyReserves ?? []).map((reserve) => ({
    ...reserve,
    id: `${sdkMarket?.address}-${reserve.underlyingToken.address}`,
  }));

  const borrowReserves = (sdkMarket?.borrowReserves ?? []).map((reserve) => ({
    ...reserve,
    id: `${sdkMarket?.address}-${reserve.underlyingToken.address}`,
  }));

  const eModeCategories = sdkMarket?.eModeCategories ?? [];
  const marketUserState = sdkMarket?.userState ?? undefined;

  const { data: reservesData, isPending: reservesDataLoading } =
    usePoolReservesHumanized(currentMarketData);
  const { data: formattedPoolReserves, isPending: formattedPoolReservesLoading } =
    usePoolFormattedReserves(currentMarketData);
  const baseCurrencyData = reservesData?.baseCurrencyData;
  // user hooks

  const eModes = formattedPoolReserves ? formatEmodes(formattedPoolReserves) : {};

  const { data: userReservesData, isPending: userReservesDataLoading } =
    useUserPoolReservesHumanized(currentMarketData);
  const { data: userSummary, isPending: userSummaryLoading } =
    useExtendedUserSummaryAndIncentives(currentMarketData);
  const userReserves = userReservesData?.userReserves;

  // loading
  const isReservesLoading = reservesDataLoading || formattedPoolReservesLoading;
  const isUserDataLoading = userReservesDataLoading || userSummaryLoading;

  const loading =
    isPending ||
    userSuppliesLoading ||
    userBorrowsLoading ||
    isReservesLoading ||
    (!!currentAccount && isUserDataLoading);

  return (
    <AppDataContext.Provider
      value={{
        loading,
        market: sdkMarket,
        totalBorrows,
        supplyReserves,
        borrowReserves,
        eModeCategories,
        userState: marketUserState,
        userSupplies: userSuppliesData,
        userBorrows: userBorrowsData,
        // Legacy fields (to be removed once consumers migrate)
        reserves: formattedPoolReserves || [],
        eModes,
        user: userSummary,
        userReserves: userReserves || [],
        marketReferencePriceInUsd: baseCurrencyData?.marketReferenceCurrencyPriceInUsd || '0',
        marketReferenceCurrencyDecimals: baseCurrencyData?.marketReferenceCurrencyDecimals || 0,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppDataContext = () => useContext(AppDataContext);
