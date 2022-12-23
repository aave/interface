import {
  InterestRate,
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  UserReserveDataHumanized,
  valueToWei,
} from '@aave/contract-helpers';
import { V3MigrationHelperSignedPermit } from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import {
  ComputedUserReserve,
  formatReserves,
  FormatReserveUSDResponse,
  formatUserSummary,
  FormatUserSummaryResponse,
  rayDiv,
  valueToBigNumber,
} from '@aave/math-utils';
import { SignatureLike } from '@ethersproject/bytes';
import { BigNumberish, constants } from 'ethers';

import {
  selectCurrentChainIdV2MarketData,
  selectCurrentChainIdV3MarketData,
  selectFormatBaseCurrencyData,
  selectNonEmptyUserBorrowPositions,
  selectUserNonEmtpySummaryAndIncentive,
  selectUserSummaryAndIncentives,
} from './poolSelectors';
import { RootStore } from './root';

export const selectIsolationModeForMigration = (
  store: RootStore,
  poolReserveV3Summary: Pick<
    FormatUserSummaryResponse<ReserveDataHumanized & FormatReserveUSDResponse>,
    'totalCollateralMarketReferenceCurrency' | 'isolatedReserve'
  >
) => {
  if (poolReserveV3Summary.totalCollateralMarketReferenceCurrency !== '0') {
    return poolReserveV3Summary.isolatedReserve;
  }
  return undefined;
};

export const selectMigrationSelectedSupplyIndex = (store: RootStore, underlyingAsset: string) => {
  return store.selectedMigrationSupplyAssets.findIndex(
    (supplyAsset) => supplyAsset.underlyingAsset == underlyingAsset
  );
};

export const selectMigrationSelectedBorrowIndex = (store: RootStore, underlyingAsset: string) => {
  return store.selectedMigrationBorrowAssets.findIndex(
    (supplyAsset) => supplyAsset.underlyingAsset == underlyingAsset
  );
};

export const selectMappedBorrowPositionsForMigration = (store: RootStore, timestamp: number) => {
  const borrowPositions = selectNonEmptyUserBorrowPositions(store, timestamp);
  const mappedBorrowPositions = borrowPositions.map((borrow) => {
    return {
      ...borrow,
      // TODO: make mapping for isolated borrowing here
      disabled: false,
    };
  });

  return mappedBorrowPositions;
};

export const selectDefinitiveSupplyAssetForMigration = (
  store: RootStore,
  userReservesV3Map: Record<
    string,
    ComputedUserReserve<ReserveDataHumanized & FormatReserveUSDResponse>
  >
) => {
  const enforcedAssets = store.selectedMigrationSupplyAssets.filter(
    (supplyAsset) => supplyAsset.enforced
  );

  if (enforcedAssets.length > 0) {
    return enforcedAssets;
  }

  const nonIsolatedAssets = store.selectedMigrationSupplyAssets.filter((supplyAsset) => {
    const v3UserReserve = userReservesV3Map[supplyAsset.underlyingAsset];
    return v3UserReserve.underlyingBalance == '0' && !v3UserReserve.reserve.isIsolated;
  });

  if (nonIsolatedAssets.length > 0) {
    return nonIsolatedAssets;
  }

  const isolatedAssets = store.selectedMigrationSupplyAssets.filter((supplyAsset) => {
    const v3UserReserve = userReservesV3Map[supplyAsset.underlyingAsset];
    return v3UserReserve.underlyingBalance == '0' && v3UserReserve.reserve.isIsolated;
  });

  return isolatedAssets;
};

export const selectUserReservesMapFromUserReserves = (
  userReservesData: ComputedUserReserve<ReserveDataHumanized & FormatReserveUSDResponse>[]
) => {
  const v3ReservesMap = userReservesData.reduce((obj, item) => {
    obj[item.underlyingAsset] = item;
    return obj;
  }, {} as Record<string, ComputedUserReserve<ReserveDataHumanized & FormatReserveUSDResponse>>);

  return v3ReservesMap;
};

export const selectUserReservesForMigration = (store: RootStore, timestamp: number) => {
  const { userReservesData: userReserveV3Data, ...v3ReservesUserSummary } = selectV3UserSummary(
    store,
    timestamp
  );

  const { userReservesData: userReservesV2Data, ...v2ReservesUserSummary } =
    selectUserSummaryAndIncentives(store, timestamp);

  let isolatedReserveV3 = selectIsolationModeForMigration(store, v3ReservesUserSummary);

  const v3ReservesMap = selectUserReservesMapFromUserReserves(userReserveV3Data);

  if (v3ReservesUserSummary.totalCollateralMarketReferenceCurrency == '0') {
    const definitiveAssets = selectDefinitiveSupplyAssetForMigration(store, v3ReservesMap);
    if (definitiveAssets.length > 0) {
      const definitiveAsset = v3ReservesMap[definitiveAssets[0].underlyingAsset];
      if (definitiveAsset.reserve.usageAsCollateralEnabled && definitiveAsset.reserve.isIsolated) {
        isolatedReserveV3 = definitiveAsset.reserve;
      }
    }
  }

  const supplyReserves = userReservesV2Data.filter(
    (userReserve) => userReserve.underlyingBalance !== '0'
  );

  const borrowReserves = userReservesV2Data.filter(
    (reserve) => reserve.variableBorrows != '0' || reserve.stableBorrows != '0'
  );

  const mappedSupplyReserves = supplyReserves.map((userReserve) => {
    // TODO: make dynamic mapping for enabled as collateral
    let usageAsCollateralEnabledOnUser = true;
    const isolatedOnV3 = v3ReservesMap[userReserve.underlyingAsset]?.reserve.isIsolated;
    const canBeEnforced = v3ReservesMap[userReserve.underlyingAsset]?.underlyingBalance == '0';
    if (isolatedReserveV3) {
      usageAsCollateralEnabledOnUser =
        userReserve.underlyingAsset == isolatedReserveV3.underlyingAsset;
    } else {
      const v3SupplyAsset = v3ReservesMap[userReserve.underlyingAsset];
      if (v3SupplyAsset?.underlyingBalance !== '0') {
        usageAsCollateralEnabledOnUser = v3SupplyAsset?.usageAsCollateralEnabledOnUser;
      } else {
        usageAsCollateralEnabledOnUser = !isolatedOnV3;
      }
    }
    return {
      ...userReserve,
      usageAsCollateralEnabledOnUser,
      isolatedOnV3,
      canBeEnforced,
    };
  });

  const mappedBorrowReserves = borrowReserves.map((userReserve) => {
    // TOOD: make mapping for liquidity
    let disabledForMigration = false;
    if (isolatedReserveV3) {
      disabledForMigration =
        !v3ReservesMap[userReserve.underlyingAsset].reserve.borrowableInIsolation;
    }
    return {
      ...userReserve,
      disabledForMigration,
    };
  });

  return {
    totalCollateralUSD: v2ReservesUserSummary.totalCollateralUSD,
    totalBorrowsUSD: v2ReservesUserSummary.totalBorrowsUSD,
    healthFactor: v2ReservesUserSummary.healthFactor,
    borrowReserves: mappedBorrowReserves,
    supplyReserves: mappedSupplyReserves,
    isolatedReserveV3,
  };
};

export const selectedUserSupplyReservesForMigration = (store: RootStore, timestamp: number) => {
  const { supplyReserves, isolatedReserveV3 } = selectUserReservesForMigration(store, timestamp);
  const selectedUserReserves = supplyReserves.filter(
    (userReserve) => selectMigrationSelectedSupplyIndex(store, userReserve.underlyingAsset) >= 0
  );
  selectedUserReserves.sort((userReserve) => {
    if (!isolatedReserveV3) {
      if (userReserve.isolatedOnV3) {
        return 1;
      }
      return -1;
    } else {
      if (isolatedReserveV3.underlyingAsset == userReserve.underlyingAsset) {
        return -1;
      } else {
        return 1;
      }
    }
  });

  return selectedUserReserves;
};

export const selectUserSupplyIncreasedReservesForMigrationPermits = (
  store: RootStore,
  timestamp: number
) => {
  return selectedUserSupplyReservesForMigration(store, timestamp).map((userReserve) => {
    const increasedAmount = addPercent(userReserve.underlyingBalance);
    const valueInWei = valueToWei(increasedAmount, userReserve.reserve.decimals);
    return { ...userReserve, increasedAmount: valueInWei };
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

// adding  30 min of variable or either stable or variable debt APY similar to swap
// https://github.com/aave/interface/blob/main/src/hooks/useSwap.ts#L72-L78
const add1HourBorrowAPY = (amount: string, borrowAPY: string) => {
  const convertedAmount = valueToBigNumber(amount);
  const convertedBorrowAPY = valueToBigNumber(borrowAPY);
  return convertedAmount
    .plus(convertedAmount.multipliedBy(convertedBorrowAPY).dividedBy(360 * 48))
    .toString();
};

export const selectUserBorrowReservesForMigration = (store: RootStore, timestamp: number) => {
  const { borrowReserves } = selectUserReservesForMigration(store, timestamp);
  const selectedUserReserves = borrowReserves
    .filter(
      (userReserve) =>
        valueToBigNumber(userReserve.stableBorrows).isGreaterThan(0) ||
        valueToBigNumber(userReserve.variableBorrows).isGreaterThan(0)
    )
    .filter(
      (userReserve) => selectMigrationSelectedBorrowIndex(store, userReserve.underlyingAsset) >= 0
    )
    .filter((userReserve) => !userReserve.disabledForMigration)
    .map(({ reserve, ...userReserve }) => {
      const stableBorrows = valueToBigNumber(userReserve.stableBorrows);
      if (stableBorrows.isGreaterThan(0)) {
        const increasedAmount = add1HourBorrowAPY(
          userReserve.stableBorrows,
          reserve.stableBorrowAPY
        );
        return {
          ...userReserve,
          reserve,
          increasedAmount,
          interestRate: InterestRate.Stable,
        };
      }
      const increasedAmount = add1HourBorrowAPY(
        userReserve.variableBorrows,
        reserve.variableBorrowAPY
      );
      return {
        ...userReserve,
        reserve,
        increasedAmount,
        interestRate: InterestRate.Variable,
      };
    });

  return selectedUserReserves;
};

export const selectFormatUserSummaryForMigration = (
  reserves: ReserveDataHumanized[] = [],
  userReserves: UserReserveDataHumanized[] = [],
  baseCurrencyData: PoolBaseCurrencyHumanized,
  currentTimestamp: number,
  userEmodeCategoryId = 0
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
    userEmodeCategoryId,
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

      const isSupplyAsset =
        selectMigrationSelectedSupplyIndex(store, userReserve.underlyingAsset) >= 0;
      if (isSupplyAsset) {
        scaledATokenBalance = '0';
      }
      const isBorrowAsset =
        selectMigrationSelectedBorrowIndex(store, userReserve.underlyingAsset) >= 0;

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
    currentTimestamp,
    poolReserve?.userEmodeCategoryId
  );
};

export const selectV3UserSummaryAfterMigration = (store: RootStore, currentTimestamp: number) => {
  const poolReserveV3Summary = selectV3UserSummary(store, currentTimestamp);
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

  const userReserves = poolReserveV3Summary.userReservesData.map((userReserveData) => {
    const borrowAsset = borrowsMap[userReserveData.underlyingAsset];
    const supplyAsset = suppliesMap[userReserveData.underlyingAsset];

    let combinedScaledDownVariableDebtV3 = userReserveData.scaledVariableDebt;
    let combinedScaledDownABalance = userReserveData.scaledATokenBalance;
    const usageAsCollateralEnabledOnUser = supplyAsset?.usageAsCollateralEnabledOnUser;
    // TODO: combine stable borrow amount as well
    if (borrowAsset && borrowAsset.interestRate == InterestRate.Variable) {
      const scaledDownVariableDebtV3 = valueToBigNumber(userReserveData.scaledVariableDebt);
      const variableBorrowIndexV3 = valueToBigNumber(userReserveData.reserve.variableBorrowIndex);
      const scaledDownVariableDebtV2Balance = rayDiv(
        valueToWei(borrowAsset.increasedAmount, userReserveData.reserve.decimals),
        variableBorrowIndexV3
      );
      combinedScaledDownVariableDebtV3 = scaledDownVariableDebtV3
        .plus(scaledDownVariableDebtV2Balance)
        .toString();
    }

    if (supplyAsset) {
      const scaledDownATokenBalance = valueToBigNumber(userReserveData.scaledATokenBalance);
      const liquidityIndexV3 = valueToBigNumber(userReserveData.reserve.liquidityIndex);
      const scaledDownBalanceV2 = rayDiv(
        valueToWei(supplyAsset.underlyingBalance, userReserveData.reserve.decimals),
        liquidityIndexV3
      );
      combinedScaledDownABalance = scaledDownATokenBalance.plus(scaledDownBalanceV2).toString();
    }

    return {
      ...userReserveData,
      id: userReserveData.reserve.id,
      scaledVariableDebt: combinedScaledDownVariableDebtV3,
      scaledATokenBalance: combinedScaledDownABalance,
      usageAsCollateralEnabledOnUser,
    };
  });

  const baseCurrencyData = selectFormatBaseCurrencyData(poolReserveV3);

  const formattedUserSummary = selectFormatUserSummaryForMigration(
    poolReserveV3?.reserves,
    userReserves,
    baseCurrencyData,
    currentTimestamp,
    poolReserveV3?.userEmodeCategoryId
  );

  // return the smallest object possible for migration page
  return {
    healthFactor: formattedUserSummary.healthFactor,
  };
};

export const selectV3UserSummary = (store: RootStore, timestamp: number) => {
  const poolReserveV3 = selectCurrentChainIdV3MarketData(store);
  const baseCurrencyData = selectFormatBaseCurrencyData(poolReserveV3);

  const formattedUserSummary = selectFormatUserSummaryForMigration(
    poolReserveV3?.reserves,
    poolReserveV3?.userReserves,
    baseCurrencyData,
    timestamp,
    poolReserveV3?.userEmodeCategoryId
  );
  return formattedUserSummary;
};

export const selectIsMigrationAvailable = (store: RootStore) => {
  return Boolean(store.currentMarketData.addresses.V3_MIGRATOR);
};
