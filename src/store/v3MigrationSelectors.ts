import {
  InterestRate,
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  UserReserveDataHumanized,
  valueToWei,
} from '@aave/contract-helpers';
import { V3MigrationHelperSignedPermit } from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import { formatReserves, formatUserSummary, valueToBigNumber } from '@aave/math-utils';
import { SignatureLike } from '@ethersproject/bytes';
import { BigNumberish, constants } from 'ethers';

import {
  selectCurrentChainIdV2MarketData,
  selectCurrentChainIdV3MarketData,
  selectFormatBaseCurrencyData,
  selectUserNonEmtpySummaryAndIncentive,
  selectUserSummaryAndIncentives,
} from './poolSelectors';
import { RootStore } from './root';

export const selectedUserSupplyReservesForMigration = (store: RootStore, timestamp: number) => {
  const user = selectUserNonEmtpySummaryAndIncentive(store, timestamp);
  const selectedUserReserves = user.userReservesData.filter(
    (userReserve) => store.selectedMigrationSupplyAssets[userReserve.underlyingAsset]
  );
  return selectedUserReserves;
};

export const selectUserSupplyIncreasedReservesForMigrationPermits = (
  store: RootStore,
  timestamp: number
) => {
  return selectedUserSupplyReservesForMigration(store, timestamp).map((userReserve) => {
    const increasedAmount = addPercent(userReserve.underlyingBalance);
    return { ...userReserve, increasedAmount };
  });
};

export const selectUserSupplyAssetsForMigrationNoPermit = (store: RootStore, timestamp: number) => {
  const selectedUserReserves = selectedUserSupplyReservesForMigration(store, timestamp);
  return selectedUserReserves.map(({ underlyingAsset, reserve }) => {
    const deadline = Math.floor(Date.now() / 1000 + 3600);
    return {
      amount: constants.MaxUint256.toString(),
      aToken: reserve.aTokenAddress,
      underlyingAsset: underlyingAsset,
      deadline,
    };
  });
};

export const selectUserSupplyAssetsForMigrationWithPermits = (
  store: RootStore,
  signatures: SignatureLike[],
  deadline: BigNumberish
): V3MigrationHelperSignedPermit[] => {
  return store.approvalPermitsForMigrationAssets.map(({ amount, underlyingAsset }, index) => {
    return {
      signedPermit: signatures[index],
      deadline,
      aToken: underlyingAsset,
      value: amount,
    };
  });
};

const addPercent = (amount: string) => {
  const convertedAmount = valueToBigNumber(amount);
  return convertedAmount.plus(convertedAmount.div(1000)).toString();
};

// adding 1 hour of variable or either stable or variable debt APY similar to swap
// https://github.com/aave/interface/blob/main/src/hooks/useSwap.ts#L72-L78
const add1HourBorrowAPY = (amount: string, borrowAPY: string) => {
  const convertedAmount = valueToBigNumber(amount);
  const convertedBorrowAPY = valueToBigNumber(borrowAPY);
  return convertedAmount
    .plus(convertedAmount.multipliedBy(convertedBorrowAPY).dividedBy(360 * 24))
    .toString();
};

export const selectUserBorrowReservesForMigration = (store: RootStore, timestamp: number) => {
  const user = selectUserSummaryAndIncentives(store, timestamp);
  const selectedUserReserves = user.userReservesData
    // should filter for empty positions?
    .filter(
      (userReserve) =>
        valueToBigNumber(userReserve.stableBorrows).isGreaterThan(0) ||
        valueToBigNumber(userReserve.variableBorrows).isGreaterThan(0)
    )
    .filter((userReserve) => store.selectedMigrationBorrowAssets[userReserve.underlyingAsset])
    .map(({ reserve, ...userReserve }) => {
      const stableBorrows = valueToBigNumber(userReserve.stableBorrows);
      if (stableBorrows.isGreaterThan(0)) {
        const increasedAmount = add1HourBorrowAPY(
          userReserve.stableBorrows,
          reserve.stableBorrowAPY
        );
        const increasedAmountInWei = valueToWei(increasedAmount, reserve.decimals);
        return {
          ...userReserve,
          reserve,
          increasedAmount,
          increasedAmountInWei,
          interestRate: InterestRate.Stable,
        };
      }
      const increasedAmount = add1HourBorrowAPY(
        userReserve.variableBorrows,
        reserve.variableBorrowAPY
      );
      const increasedAmountInWei = valueToWei(increasedAmount, reserve.decimals);
      return {
        ...userReserve,
        reserve,
        increasedAmount,
        increasedAmountInWei,
        interestRate: InterestRate.Variable,
      };
    });

  return selectedUserReserves;
};

export const selectFormatUserSummaryForMigration = (
  reserves: ReserveDataHumanized[] = [],
  userReserves: UserReserveDataHumanized[] = [],
  baseCurrencyData: PoolBaseCurrencyHumanized,
  currentTimestamp: number
) => {
  const { marketReferenceCurrencyDecimals, marketReferenceCurrencyPriceInUsd } = baseCurrencyData;
  const formattedReserves = formatReserves({
    reserves: reserves,
    currentTimestamp,
    marketReferenceCurrencyDecimals: marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: marketReferenceCurrencyPriceInUsd,
  });

  const formattedSummary = formatUserSummary({
    currentTimestamp,
    formattedReserves,
    marketReferenceCurrencyDecimals: marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: marketReferenceCurrencyPriceInUsd,
    userReserves,
    userEmodeCategoryId: 0,
  });

  return formattedSummary;
};

export const selectV2UserSummaryAfterMigration = (store: RootStore, currentTimestamp: number) => {
  const poolReserve = selectCurrentChainIdV2MarketData(store);

  const userReserves =
    poolReserve?.userReserves?.map((userReserve) => {
      let scaledATokenBalance = userReserve.scaledATokenBalance;
      let principalStableDebt = userReserve.principalStableDebt;
      let scaledVariableDebt = userReserve.scaledVariableDebt;

      const isSupplyAsset = store.selectedMigrationSupplyAssets[userReserve.underlyingAsset];
      if (isSupplyAsset) {
        scaledATokenBalance = '0';
      }
      const isBorrowAsset = store.selectedMigrationBorrowAssets[userReserve.underlyingAsset];
      if (isBorrowAsset) {
        principalStableDebt = '0';
        scaledVariableDebt = '0';
      }
      return {
        ...userReserve,
        principalStableDebt,
        scaledATokenBalance,
        scaledVariableDebt,
      };
    }) || [];

  const baseCurrencyData = selectFormatBaseCurrencyData(poolReserve);

  return selectFormatUserSummaryForMigration(
    poolReserve?.reserves,
    userReserves,
    baseCurrencyData,
    currentTimestamp
  );
};

const combine = (a: string, b: string): string => {
  return valueToBigNumber(a).plus(valueToBigNumber(b)).toString();
};

export const selectV3UserSummaryAfterMigration = (store: RootStore, currentTimestamp: number) => {
  const poolReserveV3 = selectCurrentChainIdV3MarketData(store);

  const supplies = selectedUserSupplyReservesForMigration(store, currentTimestamp);
  const borrows = selectUserBorrowReservesForMigration(store, currentTimestamp);

  //TODO: refactor that to be more efficient
  const suppliesMap = supplies.concat(supplies).reduce((obj, item) => {
    obj[item.underlyingAsset] = item;
    return obj;
  }, {} as Record<string, typeof supplies[0]>);

  const borrowsMap = borrows.concat(borrows).reduce((obj, item) => {
    obj[item.underlyingAsset] = item;
    return obj;
  }, {} as Record<string, typeof borrows[0]>);

  const userReserves = poolReserveV3?.userReserves?.map((userReserve) => {
    let scaledATokenBalance = userReserve.scaledATokenBalance;
    let scaledVariableDebt = userReserve.scaledVariableDebt;
    let principalStableDebt = userReserve.principalStableDebt;
    const reserve = poolReserveV3.reserves?.filter(
      (reserve) => reserve.underlyingAsset == userReserve.underlyingAsset
    );
    const suppliedAsset = suppliesMap[userReserve.underlyingAsset];
    if (suppliedAsset) {
      scaledATokenBalance = combine(scaledATokenBalance, suppliedAsset.scaledATokenBalance);
    }
    const borrowedAsset = borrowsMap[userReserve.underlyingAsset];
    if (borrowedAsset) {
      scaledVariableDebt = combine(scaledVariableDebt, borrowedAsset.increasedAmountInWei);
      principalStableDebt = combine(principalStableDebt, borrowedAsset.increasedAmountInWei);
    }
    let usageAsCollateralEnabledOnUser = false;
    if (reserve && reserve[0]) {
      usageAsCollateralEnabledOnUser = reserve[0].usageAsCollateralEnabled;
    }

    return {
      ...userReserve,
      scaledATokenBalance,
      usageAsCollateralEnabledOnUser,
      scaledVariableDebt,
      principalStableDebt,
    };
  });

  const baseCurrencyData = selectFormatBaseCurrencyData(poolReserveV3);

  return selectFormatUserSummaryForMigration(
    poolReserveV3?.reserves,
    userReserves,
    baseCurrencyData,
    currentTimestamp
  );
};

export const selectV3UserSummary = (store: RootStore, timestamp: number) => {
  const poolReserveV3 = selectCurrentChainIdV3MarketData(store);
  const baseCurrencyData = selectFormatBaseCurrencyData(poolReserveV3);

  return selectFormatUserSummaryForMigration(
    poolReserveV3?.reserves,
    poolReserveV3?.userReserves,
    baseCurrencyData,
    timestamp
  );
};

export const selectIsMigrationAvailable = (store: RootStore) => {
  return Boolean(store.currentMarketData.addresses.V3_MIGRATOR);
};
