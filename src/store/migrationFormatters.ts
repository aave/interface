import {
  InterestRate,
  ReserveDataHumanized,
  ReservesIncentiveDataHumanized,
  valueToWei,
} from '@aave/contract-helpers';
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  FormatReserveUSDResponse,
  formatUserSummary,
  formatUserSummaryAndIncentives,
  rayDiv,
  UserReservesIncentivesDataHumanized,
  valueToBigNumber,
} from '@aave/math-utils';
import { NetworkConfig } from 'src/ui-config/networksConfig';

import { formatReserves, selectFormatBaseCurrencyData } from './poolSelectors';
import { PoolReserve } from './poolSlice';
import {
  IsolatedReserve,
  MigrationDisabled,
  selectFormatUserSummaryForMigration,
  selectIsolationModeForMigration,
  selectMigrationSelectedBorrowIndex,
  selectSplittedBorrowsForMigration,
  selectUserReservesMapFromUserReserves,
  V3Rates,
} from './v3MigrationSelectors';
import {
  MigrationExceptionsMap,
  MigrationSelectedAsset,
  MigrationSelectedBorrowAsset,
} from './v3MigrationSlice';

export const selectMigrationUnderlyingAssetWithExceptions = (
  migrationExceptions: MigrationExceptionsMap,
  exceptionsBalancesLoading: boolean,
  reserve: {
    underlyingAsset: string;
  }
): string => {
  const defaultUnderlyingAsset = reserve?.underlyingAsset;
  if (!exceptionsBalancesLoading && migrationExceptions[defaultUnderlyingAsset]) {
    return migrationExceptions[defaultUnderlyingAsset].v3UnderlyingAsset;
  }
  return defaultUnderlyingAsset;
};

export const selectMigrationAssetBalanceWithExceptions = (
  migrationExceptions: MigrationExceptionsMap,
  exceptionsBalancesLoading: boolean,
  reserve: {
    underlyingAsset: string;
    underlyingBalance: string;
  }
) => {
  const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(
    migrationExceptions,
    exceptionsBalancesLoading,
    reserve
  );
  if (!exceptionsBalancesLoading) {
    const exceptionAsset = migrationExceptions[underlyingAssetAddress];
    if (exceptionAsset) {
      return exceptionAsset.amount;
    }
    return reserve.underlyingBalance;
  }
  return reserve.underlyingBalance;
};

export const selectDefinitiveSupplyAssetForMigration = (
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  migrationExceptions: MigrationExceptionsMap,
  exceptionsBalancesLoading: boolean,
  userReservesV3Map: Record<
    string,
    ComputedUserReserve<ReserveDataHumanized & FormatReserveUSDResponse>
  >
) => {
  const enforcedAssets = selectedMigrationSupplyAssets.filter(
    (supplyAsset) => supplyAsset.enforced
  );

  if (enforcedAssets.length > 0) {
    return enforcedAssets;
  }

  const nonIsolatedAssets = selectedMigrationSupplyAssets.filter((supplyAsset) => {
    const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(
      migrationExceptions,
      exceptionsBalancesLoading,
      supplyAsset
    );
    const v3UserReserve = userReservesV3Map[underlyingAssetAddress];
    const v3ReserveBalanceWithExceptions = selectMigrationAssetBalanceWithExceptions(
      migrationExceptions,
      exceptionsBalancesLoading,
      v3UserReserve
    );
    if (v3UserReserve) {
      return v3ReserveBalanceWithExceptions == '0' && !v3UserReserve.reserve.isIsolated;
    } else {
      return false;
    }
  });

  if (nonIsolatedAssets.length > 0) {
    return nonIsolatedAssets;
  }

  const isolatedAssets = selectedMigrationSupplyAssets.filter((supplyAsset) => {
    const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(
      migrationExceptions,
      exceptionsBalancesLoading,
      supplyAsset
    );
    const v3UserReserve = userReservesV3Map[underlyingAssetAddress];
    const v3ReserveBalanceWithExceptions = selectMigrationAssetBalanceWithExceptions(
      migrationExceptions,
      exceptionsBalancesLoading,
      v3UserReserve
    );
    return v3ReserveBalanceWithExceptions == '0' && v3UserReserve.reserve.isIsolated;
  });

  return isolatedAssets;
};

export const getPoolUserSummary = (poolReserve: PoolReserve, currentTimestamp: number) => {
  const baseCurrencyData = selectFormatBaseCurrencyData(poolReserve);
  const formattedReservesV3 = formatReservesAndIncentives({
    reserves: poolReserve.reserves ?? [],
    reserveIncentives: poolReserve.reserveIncentives ?? [],
    currentTimestamp,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });
  return formatUserSummary({
    currentTimestamp,
    formattedReserves: formattedReservesV3,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    userReserves: poolReserve.userReserves ?? [],
    userEmodeCategoryId: poolReserve.userEmodeCategoryId || 0,
  });
};

export const getUserReservesForMigration = (
  poolReservesV3: PoolReserve,
  poolReservesV2: PoolReserve,
  v2UserIncentiveData: UserReservesIncentivesDataHumanized[],
  v2ReserveIncentiveData: ReservesIncentiveDataHumanized[],
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  migrationExceptionsMap: MigrationExceptionsMap,
  migrationExceptionsLoading: boolean,
  currentNetworkConfig: NetworkConfig,
  currentTimestamp: number
) => {
  const { userReservesData: userReserveV3Data, ...v3ReservesUserSummary } = getPoolUserSummary(
    poolReservesV3,
    currentTimestamp
  );

  const v2BaseCurrencyData = selectFormatBaseCurrencyData(poolReservesV2);
  const formattedReservesV2 = formatReserves(
    poolReservesV2.reserves ?? [],
    v2BaseCurrencyData,
    currentNetworkConfig,
    currentTimestamp,
    v2ReserveIncentiveData
  );
  const { userReservesData: userReservesV2Data, ...v2ReservesUserSummary } =
    formatUserSummaryAndIncentives({
      currentTimestamp,
      marketReferencePriceInUsd: v2BaseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals: v2BaseCurrencyData.marketReferenceCurrencyDecimals,
      userReserves: poolReservesV2.userReserves ?? [],
      formattedReserves: formattedReservesV2,
      userEmodeCategoryId: poolReservesV2.userEmodeCategoryId || 0,
      reserveIncentives: v2ReserveIncentiveData,
      userIncentives: v2UserIncentiveData,
    });

  const userEmodeCategoryId = poolReservesV3?.userEmodeCategoryId;
  let isolatedReserveV3: IsolatedReserve | undefined =
    selectIsolationModeForMigration(v3ReservesUserSummary);

  const v3ReservesMap = selectUserReservesMapFromUserReserves(userReserveV3Data);

  if (v3ReservesUserSummary.totalCollateralMarketReferenceCurrency == '0') {
    const definitiveAssets = selectDefinitiveSupplyAssetForMigration(
      selectedMigrationSupplyAssets,
      migrationExceptionsMap,
      migrationExceptionsLoading,
      v3ReservesMap
    );
    if (definitiveAssets.length > 0) {
      const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(
        migrationExceptionsMap,
        migrationExceptionsLoading,
        definitiveAssets[0]
      );
      const definitiveAsset = v3ReservesMap[underlyingAssetAddress];
      if (
        definitiveAsset.reserve.reserveLiquidationThreshold !== '0' &&
        definitiveAsset.reserve.isIsolated
      ) {
        isolatedReserveV3 = { ...definitiveAsset.reserve, enteringIsolationMode: true };
      }
    }
  }

  const supplyReserves = userReservesV2Data.filter(
    (userReserve) => userReserve.underlyingBalance !== '0'
  );

  const borrowReserves = selectSplittedBorrowsForMigration(userReservesV2Data);

  const mappedSupplyReserves = supplyReserves.map((userReserve) => {
    let usageAsCollateralEnabledOnUserV3 = true;
    let migrationDisabled: MigrationDisabled | undefined;
    const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(
      migrationExceptionsMap,
      migrationExceptionsLoading,
      userReserve
    );

    const isolatedOnV3 = v3ReservesMap[underlyingAssetAddress]?.reserve.isIsolated;
    const canBeEnforced = v3ReservesMap[underlyingAssetAddress]?.underlyingBalance == '0';
    let v3Rates: V3Rates | undefined;
    const v3SupplyAsset = v3ReservesMap[underlyingAssetAddress];
    if (v3SupplyAsset) {
      const availableSupplies = valueToBigNumber(v3SupplyAsset.reserve.supplyCap).minus(
        v3SupplyAsset.reserve.totalLiquidity
      );

      let ltv = v3SupplyAsset.reserve.formattedBaseLTVasCollateral;
      if (
        userEmodeCategoryId !== 0 &&
        v3SupplyAsset.reserve.eModeCategoryId !== userEmodeCategoryId
      ) {
        ltv = v3SupplyAsset.reserve.formattedEModeLtv;
      }

      v3Rates = {
        stableBorrowAPY: v3SupplyAsset.stableBorrowAPY,
        variableBorrowAPY: v3SupplyAsset.reserve.variableBorrowAPY,
        supplyAPY: v3SupplyAsset.reserve.supplyAPY,
        aIncentivesData: v3SupplyAsset.reserve.aIncentivesData,
        vIncentivesData: v3SupplyAsset.reserve.vIncentivesData,
        sIncentivesData: v3SupplyAsset.reserve.sIncentivesData,
        priceInUSD: v3SupplyAsset.reserve.priceInUSD,
        ltv,
      };
      if (v3SupplyAsset.reserve.isFrozen) {
        migrationDisabled = MigrationDisabled.ReserveFrozen;
      } else if (!availableSupplies.isGreaterThan(userReserve.underlyingBalance)) {
        migrationDisabled = MigrationDisabled.NotEnoughtSupplies;
      }
    } else {
      migrationDisabled = MigrationDisabled.V3AssetMissing;
    }
    if (isolatedReserveV3) {
      usageAsCollateralEnabledOnUserV3 =
        userReserve.underlyingAsset == isolatedReserveV3.underlyingAsset;
    } else {
      if (v3SupplyAsset?.underlyingBalance !== '0') {
        usageAsCollateralEnabledOnUserV3 = v3SupplyAsset?.usageAsCollateralEnabledOnUser;
      } else {
        usageAsCollateralEnabledOnUserV3 = !isolatedOnV3;
      }
    }
    return {
      ...userReserve,
      usageAsCollateralEnabledOnUserV3,
      isolatedOnV3,
      canBeEnforced,
      migrationDisabled,
      v3Rates,
    };
  });

  const mappedBorrowReserves = borrowReserves.map((userReserve) => {
    // TOOD: make mapping for liquidity
    let disabledForMigration: MigrationDisabled | undefined;
    let v3Rates: V3Rates | undefined;
    const selectedReserve = v3ReservesMap[userReserve.underlyingAsset]?.reserve;

    // Only show one warning icon per asset row, priority is: asset missing in V3, eMode borrow disabled, isolation mode borrow disabled
    if (isolatedReserveV3 && !selectedReserve.borrowableInIsolation) {
      disabledForMigration = MigrationDisabled.IsolationModeBorrowDisabled;
    }

    const v3BorrowAsset = v3ReservesMap[userReserve.underlyingAsset];

    if (v3BorrowAsset) {
      let liquidationThreshold = v3BorrowAsset.reserve.formattedReserveLiquidationThreshold;

      if (userEmodeCategoryId !== 0 && selectedReserve?.eModeCategoryId !== userEmodeCategoryId) {
        disabledForMigration = MigrationDisabled.EModeBorrowDisabled;
        liquidationThreshold = v3BorrowAsset.reserve.formattedEModeLiquidationThreshold;
      }

      v3Rates = {
        stableBorrowAPY: v3BorrowAsset.stableBorrowAPY,
        variableBorrowAPY: v3BorrowAsset.reserve.variableBorrowAPY,
        supplyAPY: v3BorrowAsset.reserve.stableBorrowAPY,
        aIncentivesData: v3BorrowAsset.reserve.aIncentivesData,
        vIncentivesData: v3BorrowAsset.reserve.vIncentivesData,
        sIncentivesData: v3BorrowAsset.reserve.sIncentivesData,
        priceInUSD: v3BorrowAsset.reserve.priceInUSD,
        liquidationThreshold,
      };
      const notEnoughLiquidityOnV3 = valueToBigNumber(
        valueToWei(userReserve.increasedStableBorrows, userReserve.reserve.decimals)
      )
        .plus(valueToWei(userReserve.increasedVariableBorrows, userReserve.reserve.decimals))
        .isGreaterThan(v3BorrowAsset.reserve.availableLiquidity);

      if (notEnoughLiquidityOnV3) {
        disabledForMigration = MigrationDisabled.InsufficientLiquidity;
      } else if (!v3BorrowAsset.reserve.flashLoanEnabled) {
        disabledForMigration = MigrationDisabled.AssetNotFlashloanable;
      } else if (v3BorrowAsset.reserve.isFrozen) {
        disabledForMigration = MigrationDisabled.ReserveFrozen;
      }
    } else {
      disabledForMigration = MigrationDisabled.V3AssetMissing;
    }
    return {
      ...userReserve,
      v3Rates,
      migrationDisabled: disabledForMigration,
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

export const getMigrationSelectedSupplyIndex = (
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  underlyingAsset: string
) => {
  return selectedMigrationSupplyAssets.findIndex(
    (supplyAsset) => supplyAsset.underlyingAsset == underlyingAsset
  );
};

export const getV2UserSummaryAfterMigration = (
  poolReservesV3: PoolReserve,
  poolReservesV2: PoolReserve,
  v2UserIncentiveData: UserReservesIncentivesDataHumanized[],
  v2ReserveIncentiveData: ReservesIncentiveDataHumanized[],
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[],
  migrationExceptionsMap: MigrationExceptionsMap,
  migrationExceptionsLoading: boolean,
  currentNetworkConfig: NetworkConfig,
  currentTimestamp: number
) => {
  const { borrowReserves: borrowReservesV3 } = getUserReservesForMigration(
    poolReservesV3,
    poolReservesV2,
    v2UserIncentiveData,
    v2ReserveIncentiveData,
    selectedMigrationSupplyAssets,
    migrationExceptionsMap,
    migrationExceptionsLoading,
    currentNetworkConfig,
    currentTimestamp
  );

  const userReserves =
    poolReservesV2?.userReserves?.map((userReserve) => {
      let scaledATokenBalance = userReserve.scaledATokenBalance;
      let principalStableDebt = userReserve.principalStableDebt;
      let scaledVariableDebt = userReserve.scaledVariableDebt;

      const isSupplyAsset =
        getMigrationSelectedSupplyIndex(
          selectedMigrationSupplyAssets,
          userReserve.underlyingAsset
        ) >= 0;
      if (isSupplyAsset) {
        scaledATokenBalance = '0';
      }

      const borrowAssets = selectedMigrationBorrowAssets
        .filter((borrowAsset) => borrowAsset.underlyingAsset == userReserve.underlyingAsset)
        .filter((borrowReserveV2) => {
          const filteredReserve = borrowReservesV3.find(
            (borrowReserveV3) => borrowReserveV3.underlyingAsset == borrowReserveV2.underlyingAsset
          );
          if (filteredReserve) {
            return filteredReserve.migrationDisabled === undefined; // include asset if migration is enabled
          }
          return false; // exclude asset if V3 reserve does not exist
        });

      borrowAssets.forEach((borrowAsset) => {
        if (borrowAsset.interestRate == InterestRate.Stable) {
          principalStableDebt = '0';
        } else {
          scaledVariableDebt = '0';
        }
      });

      return {
        ...userReserve,
        principalStableDebt,
        scaledATokenBalance,
        scaledVariableDebt,
      };
    }) || [];

  const baseCurrencyData = selectFormatBaseCurrencyData(poolReservesV2);

  return selectFormatUserSummaryForMigration(
    poolReservesV2?.reserves,
    poolReservesV2?.reserveIncentives,
    userReserves,
    baseCurrencyData,
    currentTimestamp,
    poolReservesV2?.userEmodeCategoryId
  );
};

export const getUserSupplyReservesForMigration = (
  poolReservesV3: PoolReserve,
  poolReservesV2: PoolReserve,
  v2UserIncentiveData: UserReservesIncentivesDataHumanized[],
  v2ReserveIncentiveData: ReservesIncentiveDataHumanized[],
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  migrationExceptionsMap: MigrationExceptionsMap,
  migrationExceptionsLoading: boolean,
  currentNetworkConfig: NetworkConfig,
  currentTimestamp: number
) => {
  const { supplyReserves, isolatedReserveV3 } = getUserReservesForMigration(
    poolReservesV3,
    poolReservesV2,
    v2UserIncentiveData,
    v2ReserveIncentiveData,
    selectedMigrationSupplyAssets,
    migrationExceptionsMap,
    migrationExceptionsLoading,
    currentNetworkConfig,
    currentTimestamp
  );
  const selectedUserReserves = supplyReserves.filter(
    (userReserve) =>
      getMigrationSelectedSupplyIndex(selectedMigrationSupplyAssets, userReserve.underlyingAsset) >=
      0
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

export const selectSelectedBorrowReservesForMigration = (
  poolReservesV3: PoolReserve,
  poolReservesV2: PoolReserve,
  v2UserIncentiveData: UserReservesIncentivesDataHumanized[],
  v2ReserveIncentiveData: ReservesIncentiveDataHumanized[],
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[],
  migrationExceptionsMap: MigrationExceptionsMap,
  migrationExceptionsLoading: boolean,
  currentNetworkConfig: NetworkConfig,
  currentTimestamp: number
) => {
  const { borrowReserves } = getUserReservesForMigration(
    poolReservesV3,
    poolReservesV2,
    v2UserIncentiveData,
    v2ReserveIncentiveData,
    selectedMigrationSupplyAssets,
    migrationExceptionsMap,
    migrationExceptionsLoading,
    currentNetworkConfig,
    currentTimestamp
  );
  return borrowReserves.filter(
    (userReserve) =>
      selectMigrationSelectedBorrowIndex(selectedMigrationBorrowAssets, userReserve) >= 0
  );
};

export const getUserBorrowReservesForMigration = (
  poolReservesV3: PoolReserve,
  poolReservesV2: PoolReserve,
  v2UserIncentiveData: UserReservesIncentivesDataHumanized[],
  v2ReserveIncentiveData: ReservesIncentiveDataHumanized[],
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[],
  migrationExceptionsMap: MigrationExceptionsMap,
  migrationExceptionsLoading: boolean,
  currentNetworkConfig: NetworkConfig,
  currentTimestamp: number
) => {
  const { userReservesData: userReservesDataV3 } = getPoolUserSummary(
    poolReservesV3,
    currentTimestamp
  );
  const selectedUserReserves = selectSelectedBorrowReservesForMigration(
    poolReservesV3,
    poolReservesV2,
    v2UserIncentiveData,
    v2ReserveIncentiveData,
    selectedMigrationSupplyAssets,
    selectedMigrationBorrowAssets,
    migrationExceptionsMap,
    migrationExceptionsLoading,
    currentNetworkConfig,
    currentTimestamp
  )
    .filter((userReserve) => userReserve.migrationDisabled === undefined)
    // debtKey should be mapped for v3Migration
    .map((borrowReserve) => {
      let debtKey = borrowReserve.debtKey;
      const borrowReserveV3 = userReservesDataV3.find(
        (userReserve) => userReserve.underlyingAsset == borrowReserve.underlyingAsset
      );

      if (borrowReserveV3) {
        if (borrowReserve.interestRate == InterestRate.Variable) {
          debtKey = borrowReserveV3.reserve.variableDebtTokenAddress;
        } else {
          debtKey = borrowReserveV3.reserve.stableDebtTokenAddress;
        }
      }

      return {
        ...borrowReserve,
        debtKey,
      };
    });

  return selectedUserReserves;
};

export const selectMigrationUnderluingAssetWithExceptionsByV3Key = (
  migrationExceptionsMap: MigrationExceptionsMap,
  reserveV3: {
    underlyingAsset: string;
  }
) => {
  const exceptionItem = Object.values(migrationExceptionsMap).find(
    (exception) => exception.v3UnderlyingAsset == reserveV3.underlyingAsset
  );
  return exceptionItem?.v2UnderlyingAsset || reserveV3.underlyingAsset;
};

export const selectV3UserSummaryAfterMigration = (
  poolReservesV3: PoolReserve,
  poolReservesV2: PoolReserve,
  v2UserIncentiveData: UserReservesIncentivesDataHumanized[],
  v2ReserveIncentiveData: ReservesIncentiveDataHumanized[],
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[],
  migrationExceptionsMap: MigrationExceptionsMap,
  migrationExceptionsLoading: boolean,
  currentNetworkConfig: NetworkConfig,
  currentTimestamp: number
) => {
  const poolReserveV3Summary = getPoolUserSummary(poolReservesV3, currentTimestamp);

  const supplies = getUserSupplyReservesForMigration(
    poolReservesV3,
    poolReservesV2,
    v2UserIncentiveData,
    v2ReserveIncentiveData,
    selectedMigrationSupplyAssets,
    migrationExceptionsMap,
    migrationExceptionsLoading,
    currentNetworkConfig,
    currentTimestamp
  );
  const borrows = getUserBorrowReservesForMigration(
    poolReservesV3,
    poolReservesV2,
    v2UserIncentiveData,
    v2ReserveIncentiveData,
    selectedMigrationSupplyAssets,
    selectedMigrationBorrowAssets,
    migrationExceptionsMap,
    migrationExceptionsLoading,
    currentNetworkConfig,
    currentTimestamp
  );

  //TODO: refactor that to be more efficient
  const suppliesMap = supplies.reduce((obj, item) => {
    obj[item.underlyingAsset] = item;
    return obj;
  }, {} as Record<string, typeof supplies[0]>);

  const borrowsMap = borrows.reduce((obj, item) => {
    obj[item.debtKey] = item;
    return obj;
  }, {} as Record<string, typeof borrows[0]>);

  const userReserves = poolReserveV3Summary.userReservesData.map((userReserveData) => {
    const stableBorrowAsset = borrowsMap[userReserveData.reserve.stableDebtTokenAddress];
    const variableBorrowAsset = borrowsMap[userReserveData.reserve.variableDebtTokenAddress];

    const supplyUnderlyingAssetAddress = selectMigrationUnderluingAssetWithExceptionsByV3Key(
      migrationExceptionsMap,
      userReserveData
    );
    const supplyAsset = suppliesMap[supplyUnderlyingAssetAddress];

    let combinedScaledDownVariableDebtV3 = userReserveData.scaledVariableDebt;
    let combinedScaledDownABalance = userReserveData.scaledATokenBalance;
    let usageAsCollateralEnabledOnUser = userReserveData.usageAsCollateralEnabledOnUser;
    const variableBorrowIndexV3 = valueToBigNumber(userReserveData.reserve.variableBorrowIndex);

    if (variableBorrowAsset && variableBorrowAsset.migrationDisabled === undefined) {
      const scaledDownVariableDebtV2Balance = rayDiv(
        valueToWei(variableBorrowAsset.increasedVariableBorrows, userReserveData.reserve.decimals),
        variableBorrowIndexV3
      );
      combinedScaledDownVariableDebtV3 = valueToBigNumber(combinedScaledDownVariableDebtV3)
        .plus(scaledDownVariableDebtV2Balance)
        .toString();
    }
    if (stableBorrowAsset && stableBorrowAsset.migrationDisabled === undefined) {
      const scaledDownStableDebtV2Balance = rayDiv(
        valueToWei(stableBorrowAsset.increasedStableBorrows, userReserveData.reserve.decimals),
        variableBorrowIndexV3
      );
      combinedScaledDownVariableDebtV3 = valueToBigNumber(combinedScaledDownVariableDebtV3)
        .plus(scaledDownStableDebtV2Balance)
        .toString();
    }

    if (supplyAsset) {
      usageAsCollateralEnabledOnUser = supplyAsset.usageAsCollateralEnabledOnUserV3;
      const scaledDownATokenBalance = valueToBigNumber(userReserveData.scaledATokenBalance);
      const liquidityIndexV3 = valueToBigNumber(userReserveData.reserve.liquidityIndex);
      const underlyingBalanceV2 =
        migrationExceptionsMap[supplyUnderlyingAssetAddress]?.amount ||
        valueToWei(supplyAsset.underlyingBalance, userReserveData.reserve.decimals);

      const scaledDownBalanceV2 = rayDiv(underlyingBalanceV2, liquidityIndexV3);
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

  const baseCurrencyData = selectFormatBaseCurrencyData(poolReservesV3);

  const formattedUserSummary = selectFormatUserSummaryForMigration(
    poolReservesV3?.reserves,
    poolReservesV3?.reserveIncentives,
    userReserves,
    baseCurrencyData,
    currentTimestamp,
    poolReservesV3?.userEmodeCategoryId
  );

  // return the smallest object possible for migration page
  return {
    healthFactor: formattedUserSummary.healthFactor,
    currentLoanToValue: formattedUserSummary.currentLoanToValue,
    totalCollateralMarketReferenceCurrency:
      formattedUserSummary.totalCollateralMarketReferenceCurrency,
    totalBorrowsMarketReferenceCurrency: formattedUserSummary.totalBorrowsMarketReferenceCurrency,
  };
};
