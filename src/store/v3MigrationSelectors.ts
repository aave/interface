import {
  InterestRate,
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  ReservesIncentiveDataHumanized,
  UserReserveDataHumanized,
  valueToWei,
} from '@aave/contract-helpers';
import { V3MigrationHelperSignedPermit } from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import {
  ComputedUserReserve,
  formatReservesAndIncentives,
  FormatReserveUSDResponse,
  formatUserSummary,
  FormatUserSummaryResponse,
  rayDiv,
  valueToBigNumber,
} from '@aave/math-utils';
import {
  CalculateReserveIncentivesResponse,
  ReserveIncentiveResponse,
} from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { SignatureLike } from '@ethersproject/bytes';
import { BigNumberish, constants } from 'ethers';
import { ComputedUserReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

import {
  selectCurrentChainIdV2PoolReserve,
  selectCurrentChainIdV3PoolReserve,
  selectFormatBaseCurrencyData,
  selectUserSummaryAndIncentives,
} from './poolSelectors';
import { RootStore } from './root';
import { MigrationSelectedBorrowAsset } from './v3MigrationSlice';

export const selectIsolationModeForMigration = (
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

export const selectMigrationSelectedBorrowIndex = (
  selectedBorrowAssets: MigrationSelectedBorrowAsset[],
  borrowAsset: MigrationSelectedBorrowAsset
) => {
  return selectedBorrowAssets.findIndex((asset) => asset.debtKey == borrowAsset.debtKey);
};

export type MigrationUserReserve = ComputedUserReserveData & {
  increasedStableBorrows: string;
  increasedVariableBorrows: string;
  interestRate: InterestRate;
  debtKey: string;
  usageAsCollateralEnabledOnUserV3?: boolean;
  isolatedOnV3?: boolean;
  canBeEnforced?: boolean;
  migrationDisabled?: MigrationDisabled;
  V3Rates?: V3Rates;
};

export type V3Rates = {
  stableBorrowAPY: string;
  variableBorrowAPY: string;
  supplyAPY: string;
  aIncentivesData?: ReserveIncentiveResponse[];
  vIncentivesData?: ReserveIncentiveResponse[];
  sIncentivesData?: ReserveIncentiveResponse[];
};

export const selectSplittedBorrowsForMigration = (userReserves: ComputedUserReserveData[]) => {
  const splittedUserReserves: MigrationUserReserve[] = [];
  userReserves.forEach((userReserve) => {
    if (userReserve.stableBorrows !== '0') {
      const increasedAmount = add1HourBorrowAPY(
        userReserve.stableBorrows,
        userReserve.reserve.stableBorrowAPY
      );
      splittedUserReserves.push({
        ...userReserve,
        interestRate: InterestRate.Stable,
        increasedStableBorrows: increasedAmount,
        increasedVariableBorrows: '0',
        debtKey: userReserve.reserve.stableDebtTokenAddress,
      });
    }
    if (userReserve.variableBorrows !== '0') {
      const increasedAmount = add1HourBorrowAPY(
        userReserve.variableBorrows,
        userReserve.reserve.variableBorrowAPY
      );
      splittedUserReserves.push({
        ...userReserve,
        interestRate: InterestRate.Variable,
        increasedStableBorrows: '0',
        increasedVariableBorrows: increasedAmount,
        debtKey: userReserve.reserve.variableDebtTokenAddress,
      });
    }
  });
  return splittedUserReserves;
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

export enum MigrationDisabled {
  IsolationModeBorrowDisabled,
  EModeBorrowDisabled,
  V3AssetMissing,
  InsufficientLiquidity, // TODO
}

export type IsolatedReserve = FormatReserveUSDResponse & { enteringIsolationMode?: boolean };
export const selectUserReservesForMigration = (store: RootStore, timestamp: number) => {
  const { userReservesData: userReserveV3Data, ...v3ReservesUserSummary } = selectV3UserSummary(
    store,
    timestamp
  );

  const { userReservesData: userReservesV2Data, ...v2ReservesUserSummary } =
    selectUserSummaryAndIncentives(store, timestamp);

  const poolReserveV3 = selectCurrentChainIdV3PoolReserve(store);
  const userEmodeCategoryId = poolReserveV3?.userEmodeCategoryId;

  let isolatedReserveV3: IsolatedReserve | undefined =
    selectIsolationModeForMigration(v3ReservesUserSummary);

  const v3ReservesMap = selectUserReservesMapFromUserReserves(userReserveV3Data);

  if (v3ReservesUserSummary.totalCollateralMarketReferenceCurrency == '0') {
    const definitiveAssets = selectDefinitiveSupplyAssetForMigration(store, v3ReservesMap);
    if (definitiveAssets.length > 0) {
      const definitiveAsset = v3ReservesMap[definitiveAssets[0].underlyingAsset];
      if (definitiveAsset.reserve.usageAsCollateralEnabled && definitiveAsset.reserve.isIsolated) {
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
    const isolatedOnV3 = v3ReservesMap[userReserve.underlyingAsset]?.reserve.isIsolated;
    const canBeEnforced = v3ReservesMap[userReserve.underlyingAsset]?.underlyingBalance == '0';
    let v3Rates: V3Rates | undefined;
    const v3SupplyAsset = v3ReservesMap[userReserve.underlyingAsset];
    if (v3SupplyAsset) {
      v3Rates = {
        stableBorrowAPY: v3SupplyAsset.stableBorrowAPY,
        variableBorrowAPY: v3SupplyAsset.reserve.variableBorrowAPY,
        supplyAPY: v3SupplyAsset.reserve.supplyAPY,
        aIncentivesData: v3SupplyAsset.reserve.aIncentivesData,
        vIncentivesData: v3SupplyAsset.reserve.vIncentivesData,
        sIncentivesData: v3SupplyAsset.reserve.sIncentivesData,
      };
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
    if (userEmodeCategoryId !== 0 && selectedReserve?.eModeCategoryId !== userEmodeCategoryId) {
      disabledForMigration = MigrationDisabled.EModeBorrowDisabled;
    }
    const v3BorrowAsset = v3ReservesMap[userReserve.underlyingAsset];
    if (v3BorrowAsset) {
      v3Rates = {
        stableBorrowAPY: v3BorrowAsset.stableBorrowAPY,
        variableBorrowAPY: v3BorrowAsset.reserve.variableBorrowAPY,
        supplyAPY: v3BorrowAsset.reserve.stableBorrowAPY,
        aIncentivesData: v3BorrowAsset.reserve.aIncentivesData,
        vIncentivesData: v3BorrowAsset.reserve.vIncentivesData,
        sIncentivesData: v3BorrowAsset.reserve.sIncentivesData,
      };
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

export const selectSelectedBorrowReservesForMigrationV3 = (store: RootStore, timestamp: number) => {
  const { borrowReserves } = selectUserReservesForMigration(store, timestamp);
  const { userReservesData: userReservesDataV3 } = selectV3UserSummary(store, timestamp);
  const selectedUserReserves = borrowReserves
    .filter(
      (userReserve) =>
        selectMigrationSelectedBorrowIndex(store.selectedMigrationBorrowAssets, userReserve) >= 0
    )
    .filter((userReserve) => !userReserve.migrationDisabled)
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

export const selectFormatUserSummaryForMigration = (
  reserves: ReserveDataHumanized[] = [],
  reserveIncentives: ReservesIncentiveDataHumanized[] = [],
  userReserves: UserReserveDataHumanized[] = [],
  baseCurrencyData: PoolBaseCurrencyHumanized,
  currentTimestamp: number,
  userEmodeCategoryId = 0
) => {
  const { marketReferenceCurrencyDecimals, marketReferenceCurrencyPriceInUsd } = baseCurrencyData;
  const formattedReserves = formatReservesAndIncentives({
    reserves: reserves,
    reserveIncentives,
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
  const poolReserve = selectCurrentChainIdV2PoolReserve(store);

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

      const borrowAssets = store.selectedMigrationBorrowAssets.filter(
        (borrowAsset) => borrowAsset.underlyingAsset == userReserve.underlyingAsset
      );

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

  const baseCurrencyData = selectFormatBaseCurrencyData(poolReserve);

  return selectFormatUserSummaryForMigration(
    poolReserve?.reserves,
    poolReserve?.reserveIncentives,
    userReserves,
    baseCurrencyData,
    currentTimestamp,
    poolReserve?.userEmodeCategoryId
  );
};

export const selectV3UserSummaryAfterMigration = (store: RootStore, currentTimestamp: number) => {
  const poolReserveV3Summary = selectV3UserSummary(store, currentTimestamp);
  const poolReserveV3 = selectCurrentChainIdV3PoolReserve(store);

  const supplies = selectedUserSupplyReservesForMigration(store, currentTimestamp);
  const borrows = selectSelectedBorrowReservesForMigrationV3(store, currentTimestamp);

  //TODO: refactor that to be more efficient
  const suppliesMap = supplies.concat(supplies).reduce((obj, item) => {
    obj[item.underlyingAsset] = item;
    return obj;
  }, {} as Record<string, typeof supplies[0]>);

  const borrowsMap = borrows.concat(borrows).reduce((obj, item) => {
    obj[item.debtKey] = item;
    return obj;
  }, {} as Record<string, typeof borrows[0]>);

  const userReserves = poolReserveV3Summary.userReservesData.map((userReserveData) => {
    const stableBorrowAsset = borrowsMap[userReserveData.reserve.stableDebtTokenAddress];
    const variableBorrowAsset = borrowsMap[userReserveData.reserve.variableDebtTokenAddress];

    const supplyAsset = suppliesMap[userReserveData.underlyingAsset];

    let combinedScaledDownVariableDebtV3 = userReserveData.scaledVariableDebt;
    let combinedScaledDownABalance = userReserveData.scaledATokenBalance;
    let usageAsCollateralEnabledOnUser = userReserveData.usageAsCollateralEnabledOnUser;
    // TODO: combine stable borrow amount as well
    const variableBorrowIndexV3 = valueToBigNumber(userReserveData.reserve.variableBorrowIndex);
    if (variableBorrowAsset) {
      const scaledDownVariableDebtV2Balance = rayDiv(
        valueToWei(variableBorrowAsset.increasedVariableBorrows, userReserveData.reserve.decimals),
        variableBorrowIndexV3
      );
      combinedScaledDownVariableDebtV3 = valueToBigNumber(combinedScaledDownVariableDebtV3)
        .plus(scaledDownVariableDebtV2Balance)
        .toString();
    }
    if (stableBorrowAsset) {
      const scaledDownStableDebtV2Balance = rayDiv(
        valueToWei(stableBorrowAsset.increasedStableBorrows, userReserveData.reserve.decimals),
        variableBorrowIndexV3
      );
      combinedScaledDownVariableDebtV3 = valueToBigNumber(combinedScaledDownVariableDebtV3)
        .plus(scaledDownStableDebtV2Balance)
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
      usageAsCollateralEnabledOnUser = supplyAsset.usageAsCollateralEnabledOnUser;
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
    poolReserveV3?.reserveIncentives,
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
  const poolReserveV3 = selectCurrentChainIdV3PoolReserve(store);
  const baseCurrencyData = selectFormatBaseCurrencyData(poolReserveV3);

  const formattedUserSummary = selectFormatUserSummaryForMigration(
    poolReserveV3?.reserves,
    poolReserveV3?.reserveIncentives,
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

export type MigrationReserve = ComputedUserReserveData & { migrationDisabled?: MigrationDisabled };
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
export const assetEnabled = (selected: MigrationSelectedReserve, reserves: MigrationReserve[]) => {
  const selectedReserve = reserves.find(
    (reserve: MigrationReserve) => selected.underlyingAsset === reserve.underlyingAsset
  );
  return selectedReserve !== undefined && selectedReserve.migrationDisabled === undefined;
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
