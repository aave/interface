import { ReserveDataHumanized } from '@aave/contract-helpers';
import {
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
  FormatUserSummaryAndIncentivesResponse,
  UserReserveData,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import React, { useContext } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';

import { useCurrentTimestamp } from '../useCurrentTimestamp';
import { useProtocolDataContext } from '../useProtocolDataContext';
import {
  useC_ProtocolDataQuery,
  useC_ReservesIncentivesQuery,
  useC_UserDataQuery,
  useC_UserIncentivesQuery,
} from './graphql/hooks';

/**
 * removes the marketPrefix from a symbol
 * @param symbol
 * @param prefix
 */
export const unPrefixSymbol = (symbol: string, prefix: string) => {
  return symbol.toUpperCase().replace(RegExp(`^(${prefix[0]}?${prefix.slice(1)})`), '');
};

export type ComputedReserveData = ReturnType<typeof formatReservesAndIncentives>[0] &
  ReserveDataHumanized & { iconSymbol: string };

export interface AppDataContextType {
  reserves: ComputedReserveData[];
  // refreshPoolData?: () => Promise<void[]>;
  isUserHasDeposits: boolean;
  user?: FormatUserSummaryAndIncentivesResponse & { earnedAPY: number; debtAPY: number };
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
  const { currentMarketData } = useProtocolDataContext();

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

  const formattedPoolReserves = formatReservesAndIncentives({
    reserves,
    currentTimestamp,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    reserveIncentives: reservesIncentivesData?.reservesIncentives || [],
  });

  const userReserves: UserReserveData[] = userReservesData?.userData.userReserves || [];

  const userEmodeCategoryId = userReservesData?.userData.userEmodeCategoryId || 0;

  const user: FormatUserSummaryAndIncentivesResponse = formatUserSummaryAndIncentives({
    currentTimestamp,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves,
    formattedReserves: formattedPoolReserves,
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
        reserves: formattedPoolReserves
          .map((r) => ({ ...r, ...fetchIconSymbolAndName(r) }))
          .sort(reserveSortFn),
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
        isUserHasDeposits,
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

const stable = [
  'DAI',
  'TUSD',
  'BUSD',
  'GUSD',
  'USDC',
  'USDT',
  'EUROS',
  'FEI',
  'FRAX',
  'PAX',
  'USDP',
  'SUSD',
];

const reserveSortFn = (a: ComputedReserveData, b: ComputedReserveData) => {
  const aIsStable = stable.includes(a.iconSymbol);
  const bIsStable = stable.includes(b.iconSymbol);
  if (aIsStable && !bIsStable) return -1;
  if (!aIsStable && bIsStable) return 1;
  return a.iconSymbol > b.iconSymbol ? 1 : -1;
};
