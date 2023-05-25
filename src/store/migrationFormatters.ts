import {
  InterestRate,
  ReserveDataHumanized,
  ReservesIncentiveDataHumanized,
  tEthereumAddress,
  valueToWei,
} from '@aave/contract-helpers';
import {
  MigrationRepayAsset,
  MigrationSupplyAsset,
} from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  FormatReserveUSDResponse,
  formatUserSummary,
  formatUserSummaryAndIncentives,
  FormatUserSummaryResponse,
  rayDiv,
  UserReservesIncentivesDataHumanized,
  valueToBigNumber,
} from '@aave/math-utils';
import { CalculateReserveIncentivesResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { SignatureLike } from '@ethersproject/bytes';
import { BigNumberish } from 'ethers';
import { Approval } from 'src/helpers/useTransactionHandler';
import {
  ComputedReserveData,
  ComputedUserReserveData,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { NetworkConfig } from 'src/ui-config/networksConfig';

import { formatReserves, selectFormatBaseCurrencyData } from './poolSelectors';
import { PoolReserve } from './poolSlice';
import {
  IsolatedReserve,
  MigrationDisabled,
  MigrationUserReserve,
  selectMigrationSelectedBorrowIndex,
  selectSplittedBorrowsForMigration,
  V3Rates,
} from './v3MigrationSelectors';
import {
  MigrationExceptionsMap,
  MigrationSelectedAsset,
  MigrationSelectedBorrowAsset,
} from './v3MigrationSlice';

export type MigrationReserve = ComputedUserReserveData & { migrationDisabled?: MigrationDisabled };

type ReserveDebtApprovalPayload = {
  [underlyingAsset: string]: {
    variableDebtTokenAddress: string;
    decimals: number;
    stableDebtAmount: string;
    variableDebtAmount: string;
  };
};

type MigrationSelectedReserve = {
  underlyingAsset: string;
  enforced?: boolean;
  debtKey?: string;
  interestRate?: InterestRate;
};

type ComputedMigrationSelections = {
  activeSelections: MigrationReserve[];
  activeUnselected: MigrationReserve[];
};

export type V3MigrationHelperSignedPermit = {
  deadline: BigNumberish;
  aToken: tEthereumAddress;
  value: BigNumberish;
  signedPermit: SignatureLike;
};

export type V3MigrationHelperSignedCreditDelegationPermit = {
  deadline: BigNumberish;
  debtToken: tEthereumAddress;
  value: BigNumberish;
  signedPermit: SignatureLike;
};

export type MappedSupplyReserves = ComputedUserReserve<ComputedReserveData> & {
  usageAsCollateralEnabledOnUserV3: boolean;
  isolatedOnV3: boolean;
  canBeEnforced: boolean;
  migrationDisabled?: MigrationDisabled;
  v3Rates?: V3Rates;
};

export type MappedBorrowReserve = MigrationUserReserve & {
  v3Rates?: V3Rates;
  migrationDisabled?: MigrationDisabled;
};

export const getIsolationModeForMigration = (
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

const addPercent = (amount: string) => {
  const convertedAmount = valueToBigNumber(amount);
  return convertedAmount.plus(convertedAmount.div(1000)).toString();
};

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

export const getMigrationAssetBalanceWithExceptions = (
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

export const getDefinitiveSupplyAssetForMigration = (
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
    const v3ReserveBalanceWithExceptions = getMigrationAssetBalanceWithExceptions(
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
    const v3ReserveBalanceWithExceptions = getMigrationAssetBalanceWithExceptions(
      migrationExceptions,
      exceptionsBalancesLoading,
      v3UserReserve
    );
    return v3ReserveBalanceWithExceptions == '0' && v3UserReserve.reserve.isIsolated;
  });

  return isolatedAssets;
};

type UserSummary = FormatUserSummaryResponse<
  ReserveDataHumanized & FormatReserveUSDResponse & Partial<CalculateReserveIncentivesResponse>
>;

export const getPoolUserSummary = (
  poolReserve: PoolReserve,
  currentTimestamp: number
): UserSummary => {
  const baseCurrencyData = selectFormatBaseCurrencyData(poolReserve);
  const formattedReserves = formatReservesAndIncentives({
    reserves: poolReserve.reserves ?? [],
    reserveIncentives: poolReserve.reserveIncentives ?? [],
    currentTimestamp,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
  });
  return formatUserSummary({
    currentTimestamp,
    formattedReserves,
    marketReferenceCurrencyDecimals: baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd: baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    userReserves: poolReserve.userReserves ?? [],
    userEmodeCategoryId: poolReserve.userEmodeCategoryId || 0,
  });
};

interface UserReservesForMigration {
  totalCollateralUSD: string;
  totalBorrowsUSD: string;
  healthFactor: string;
  borrowReserves: MappedBorrowReserve[];
  supplyReserves: MappedSupplyReserves[];
  isolatedReserveV3?: IsolatedReserve;
}

export const getUserReservesForMigration = (
  poolReservesV3: PoolReserve,
  poolReservesV2: PoolReserve,
  v2UserIncentiveData: UserReservesIncentivesDataHumanized[],
  v2ReserveIncentiveData: ReservesIncentiveDataHumanized[],
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  migrationExceptionsMap: MigrationExceptionsMap,
  migrationExceptionsLoading: boolean,
  currentNetworkConfig: NetworkConfig,
  v3UserSummary: UserSummary,
  currentTimestamp: number
): UserReservesForMigration => {
  const { userReservesData: userReserveV3Data, ...v3ReservesUserSummary } = v3UserSummary;

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
    getIsolationModeForMigration(v3ReservesUserSummary);

  const v3ReservesMap = getUserReservesMapFromUserReserves(userReserveV3Data);

  if (v3ReservesUserSummary.totalCollateralMarketReferenceCurrency == '0') {
    const definitiveAssets = getDefinitiveSupplyAssetForMigration(
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

  const mappedSupplyReserves: MappedSupplyReserves[] = supplyReserves.map((userReserve) => {
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

  const mappedBorrowReserves: MappedBorrowReserve[] = borrowReserves.map((userReserve) => {
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
  poolReservesV2: PoolReserve,
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[],
  borrowReservesV3: MappedBorrowReserve[],
  currentTimestamp: number
) => {
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

  const poolReserve = {
    reserves: poolReservesV2?.reserves,
    reserveIncentives: poolReservesV2?.reserveIncentives,
    userReserves,
    baseCurrencyData,
    userEmodeCategoryId: poolReservesV2?.userEmodeCategoryId,
  };

  return getPoolUserSummary(poolReserve, currentTimestamp);
};

export const getUserSupplyReservesForMigration = (
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  supplyReserves: MappedSupplyReserves[],
  isolatedReserveV3?: IsolatedReserve
) => {
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

export const getSelectedBorrowReservesForMigration = (
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[],
  borrowReserves: MappedBorrowReserve[]
) => {
  return borrowReserves.filter(
    (userReserve) =>
      selectMigrationSelectedBorrowIndex(selectedMigrationBorrowAssets, userReserve) >= 0
  );
};

export interface SelectedBorrowReserveV3 extends MappedBorrowReserve {
  debtKey: string;
}

export const getSelectedBorrowReservesForMigrationV3 = (
  selectedBorrowReserves: MappedBorrowReserve[],
  v3UserSummary: UserSummary
): SelectedBorrowReserveV3[] => {
  const { userReservesData: userReservesDataV3 } = v3UserSummary;
  return (
    selectedBorrowReserves
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
      })
  );
};

export const getMigrationUnderluingAssetWithExceptionsByV3Key = (
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

export const getV3UserSummaryAfterMigration = (
  poolReservesV3: PoolReserve,
  selectedBorrowReservesV3: SelectedBorrowReserveV3[],
  migrationExceptionsMap: MigrationExceptionsMap,
  selectedSupplyReserves: MappedSupplyReserves[],
  v3UserSummary: UserSummary,
  currentTimestamp: number
) => {
  //TODO: refactor that to be more efficient
  const suppliesMap = selectedSupplyReserves.reduce((obj, item) => {
    obj[item.underlyingAsset] = item;
    return obj;
  }, {} as Record<string, typeof selectedSupplyReserves[0]>);

  const borrowsMap = selectedBorrowReservesV3.reduce((obj, item) => {
    obj[item.debtKey] = item;
    return obj;
  }, {} as Record<string, typeof selectedBorrowReservesV3[0]>);

  const userReserves = v3UserSummary.userReservesData.map((userReserveData) => {
    const stableBorrowAsset = borrowsMap[userReserveData.reserve.stableDebtTokenAddress];
    const variableBorrowAsset = borrowsMap[userReserveData.reserve.variableDebtTokenAddress];

    const supplyUnderlyingAssetAddress = getMigrationUnderluingAssetWithExceptionsByV3Key(
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

  const poolReserve = {
    reserves: poolReservesV3?.reserves,
    reserveIncentive: poolReservesV3.reserveIncentives,
    userReserves,
    baseCurrencyData,
    userEmodeCategoryId: poolReservesV3?.userEmodeCategoryId,
  };

  const formattedUserSummary = getPoolUserSummary(poolReserve, currentTimestamp);

  // return the smallest object possible for migration page
  return {
    healthFactor: formattedUserSummary.healthFactor,
    currentLoanToValue: formattedUserSummary.currentLoanToValue,
    totalCollateralMarketReferenceCurrency:
      formattedUserSummary.totalCollateralMarketReferenceCurrency,
    totalBorrowsMarketReferenceCurrency: formattedUserSummary.totalBorrowsMarketReferenceCurrency,
  };
};

export const getMigrationBorrowPermitPayloads = (
  selectedBorrowReserves: MappedBorrowReserve[],
  v3UserSummary: UserSummary
): Approval[] => {
  const { userReservesData: userReservesDataV3 } = v3UserSummary;

  const reserveDebts: ReserveDebtApprovalPayload = {};

  selectedBorrowReserves
    .filter((userReserve) => userReserve.migrationDisabled === undefined)
    .forEach((userReserve) => {
      const borrowReserveV3 = userReservesDataV3.find(
        (v3Reserve) => v3Reserve.underlyingAsset === userReserve.underlyingAsset
      );
      if (!borrowReserveV3) {
        return;
      }

      if (!reserveDebts[userReserve.underlyingAsset]) {
        reserveDebts[userReserve.underlyingAsset] = {
          variableDebtTokenAddress: borrowReserveV3.reserve.variableDebtTokenAddress,
          decimals: borrowReserveV3.reserve.decimals,
          stableDebtAmount: '0',
          variableDebtAmount: '0',
        };
      }

      const debt = reserveDebts[userReserve.underlyingAsset];

      if (userReserve.interestRate === InterestRate.Stable) {
        debt.stableDebtAmount = valueToBigNumber(debt.stableDebtAmount)
          .plus(valueToBigNumber(userReserve.increasedStableBorrows))
          .toString();
      } else if (userReserve.interestRate === InterestRate.Variable) {
        debt.variableDebtAmount = valueToBigNumber(debt.variableDebtAmount)
          .plus(valueToBigNumber(userReserve.increasedVariableBorrows))
          .toString();
      }
    });

  return Object.keys(reserveDebts).map<Approval>((key) => {
    const debt = reserveDebts[key];
    const totalDebt = valueToBigNumber(debt.stableDebtAmount).plus(debt.variableDebtAmount);
    const combinedAmountInWei = valueToWei(totalDebt.toString(), debt.decimals);
    return {
      amount: combinedAmountInWei,
      underlyingAsset: debt.variableDebtTokenAddress,
      permitType: 'BORROW_MIGRATOR_V3',
    };
  });
};

interface UserSupplyIncreasedReservesForMigrationPermits extends MappedSupplyReserves {
  increasedAmount: string;
}

export const getUserSupplyIncreasedReservesForMigrationPermits = (
  selectedSupplyReserves: MappedSupplyReserves[]
): UserSupplyIncreasedReservesForMigrationPermits[] => {
  return selectedSupplyReserves.map((userReserve) => {
    const increasedAmount = addPercent(userReserve.underlyingBalance);
    const valueInWei = valueToWei(increasedAmount, userReserve.reserve.decimals);
    return { ...userReserve, increasedAmount: valueInWei };
  });
};

export const getUserSupplyAssetsForMigrationNoPermit = (
  userSupplyIncreasedReservesForMigrationPermits: UserSupplyIncreasedReservesForMigrationPermits[]
): MigrationSupplyAsset[] => {
  return userSupplyIncreasedReservesForMigrationPermits.map(
    ({ underlyingAsset, reserve, increasedAmount }) => {
      const deadline = Math.floor(Date.now() / 1000 + 3600);
      return {
        amount: increasedAmount,
        aToken: reserve.aTokenAddress,
        underlyingAsset: underlyingAsset,
        deadline,
      };
    }
  );
};

export const getMigrationRepayAssets = (
  selectedBorrowReserves: MappedBorrowReserve[]
): MigrationRepayAsset[] => {
  const deadline = Math.floor(Date.now() / 1000 + 3600);
  return selectedBorrowReserves.map((userReserve) => ({
    underlyingAsset: userReserve.underlyingAsset,
    amount:
      // TODO: verify which digits
      userReserve.interestRate == InterestRate.Stable
        ? userReserve.increasedStableBorrows
        : userReserve.increasedVariableBorrows,
    deadline,
    debtToken: userReserve.debtKey,
    rateMode: userReserve.interestRate,
  }));
};

export const assetSelected = (
  reserve: MigrationReserve,
  selectedAssets: MigrationSelectedReserve[]
) => {
  const selectedReserve = selectedAssets.find(
    (selectedAsset: MigrationSelectedReserve) =>
      selectedAsset.underlyingAsset === reserve.underlyingAsset
  );
  return selectedReserve !== undefined;
};

export const computeSelections = (
  reserves: MigrationReserve[],
  selections: MigrationSelectedReserve[]
): ComputedMigrationSelections => {
  const enabledReserves = reserves.filter((reserve) => reserve.migrationDisabled === undefined);

  const selectedEnabledReserves = enabledReserves.filter((reserve) =>
    assetSelected(reserve, selections)
  );
  const unselectedEnabledReserves = enabledReserves.filter(
    (reserve) => !assetSelected(reserve, selections)
  );

  return {
    activeSelections: selectedEnabledReserves,
    activeUnselected: unselectedEnabledReserves,
  };
};

export const getUserReservesMapFromUserReserves = (
  userReservesData: ComputedUserReserve<
    ReserveDataHumanized & FormatReserveUSDResponse & Partial<CalculateReserveIncentivesResponse>
  >[]
) => {
  const v3ReservesMap = userReservesData.reduce((obj, item) => {
    obj[item.underlyingAsset] = item;
    return obj;
  }, {} as Record<string, ComputedUserReserve<ReserveDataHumanized & FormatReserveUSDResponse & Partial<CalculateReserveIncentivesResponse>>>);

  return v3ReservesMap;
};
