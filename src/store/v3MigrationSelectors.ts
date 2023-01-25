import {
  InterestRate,
  PoolBaseCurrencyHumanized,
  ReserveDataHumanized,
  ReservesIncentiveDataHumanized,
  UserReserveDataHumanized,
  valueToWei,
} from '@aave/contract-helpers';
import {
  MigrationRepayAsset,
  MigrationSupplyAsset,
  V3MigrationHelperSignedCreditDelegationPermit,
  V3MigrationHelperSignedPermit,
} from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
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
import { BigNumberish } from 'ethers';
import { Approval } from 'src/helpers/useTransactionHandler';
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
      let increasedAmount = userReserve.stableBorrows;
      if (userReserve.reserve.stableBorrowAPY == '0') {
        increasedAmount = addPercent(increasedAmount);
      } else {
        increasedAmount = add1HourBorrowAPY(
          userReserve.stableBorrows,
          userReserve.reserve.stableBorrowAPY
        );
      }
      splittedUserReserves.push({
        ...userReserve,
        interestRate: InterestRate.Stable,
        increasedStableBorrows: increasedAmount,
        increasedVariableBorrows: '0',
        debtKey: userReserve.reserve.stableDebtTokenAddress,
      });
    }
    if (userReserve.variableBorrows !== '0') {
      let increasedAmount = userReserve.variableBorrows;
      if (userReserve.reserve.variableBorrowAPY === '0') {
        increasedAmount = addPercent(increasedAmount);
      } else {
        increasedAmount = add1HourBorrowAPY(
          userReserve.variableBorrows,
          userReserve.reserve.variableBorrowAPY
        );
      }
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
    const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(store, supplyAsset);
    const v3UserReserve = userReservesV3Map[underlyingAssetAddress];
    const v3ReserveBalanceWithExceptions = selectMigrationAssetBalanceWithExceptions(
      store,
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

  const isolatedAssets = store.selectedMigrationSupplyAssets.filter((supplyAsset) => {
    const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(store, supplyAsset);
    const v3UserReserve = userReservesV3Map[underlyingAssetAddress];
    const v3ReserveBalanceWithExceptions = selectMigrationAssetBalanceWithExceptions(
      store,
      v3UserReserve
    );
    return v3ReserveBalanceWithExceptions == '0' && v3UserReserve.reserve.isIsolated;
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

export const selectMigrationUnderlyingAssetWithExceptions = (
  store: RootStore,
  reserve: {
    underlyingAsset: string;
  }
): string => {
  const defaultUnderlyingAsset = reserve.underlyingAsset;
  if (!store.exceptionsBalancesLoading && store.migrationExceptions[defaultUnderlyingAsset]) {
    return store.migrationExceptions[defaultUnderlyingAsset].v3UnderlyingAsset;
  }
  return defaultUnderlyingAsset;
};

export const selectMigrationUnderluingAssetWithExceptionsByV3Key = (
  store: RootStore,
  reserveV3: {
    underlyingAsset: string;
  }
) => {
  const exceptionItem = Object.values(store.migrationExceptions).find(
    (exception) => exception.v3UnderlyingAsset == reserveV3.underlyingAsset
  );
  return exceptionItem?.v2UnderlyingAsset || reserveV3.underlyingAsset;
};

export const selectMigrationAssetBalanceWithExceptions = (
  store: RootStore,
  reserve: {
    underlyingAsset: string;
    underlyingBalance: string;
  }
) => {
  const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(store, reserve);
  if (!store.exceptionsBalancesLoading) {
    const exceptionAsset = store.migrationExceptions[underlyingAssetAddress];
    if (exceptionAsset) {
      return exceptionAsset.amount;
    }
    return reserve.underlyingBalance;
  }
  return reserve.underlyingBalance;
};

export const seletMigrationUnderlyingBalanceExceptionByV3Key = (
  store: RootStore,
  reserveV3: {
    underlyingAsset: string;
    scaledATokenBalance: string;
  }
) => {
  if (store.exceptionsBalancesLoading) {
    return reserveV3.scaledATokenBalance;
  }
  const exceptionAsset = Object.values(store.migrationExceptions).find(
    (exception) => exception.v3UnderlyingAsset == reserveV3.underlyingAsset
  );
  if (exceptionAsset) {
    return exceptionAsset.amount;
  }
  return reserveV3.scaledATokenBalance;
};

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
      const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(
        store,
        definitiveAssets[0]
      );
      const definitiveAsset = v3ReservesMap[underlyingAssetAddress];
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
    const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(store, userReserve);

    const isolatedOnV3 = v3ReservesMap[underlyingAssetAddress]?.reserve.isIsolated;
    const canBeEnforced = v3ReservesMap[underlyingAssetAddress]?.underlyingBalance == '0';
    let v3Rates: V3Rates | undefined;
    const v3SupplyAsset = v3ReservesMap[underlyingAssetAddress];
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
      if (
        valueToBigNumber(
          valueToWei(userReserve.increasedStableBorrows, userReserve.reserve.decimals)
        )
          .plus(valueToWei(userReserve.increasedVariableBorrows, userReserve.reserve.decimals))
          .isGreaterThan(v3BorrowAsset.reserve.availableLiquidity)
      ) {
        disabledForMigration = MigrationDisabled.InsufficientLiquidity;
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

export const selectUserSupplyAssetsForMigrationNoPermit = (
  store: RootStore,
  timestamp: number
): MigrationSupplyAsset[] => {
  const selectedUserSupplyReserves = selectUserSupplyIncreasedReservesForMigrationPermits(
    store,
    timestamp
  );
  return selectedUserSupplyReserves.map(({ underlyingAsset, reserve, increasedAmount }) => {
    const deadline = Math.floor(Date.now() / 1000 + 3600);
    return {
      amount: increasedAmount,
      aToken: reserve.aTokenAddress,
      underlyingAsset: underlyingAsset,
      deadline,
    };
  });
};

export const selectMigrationRepayAssets = (
  store: RootStore,
  timestamp: number
): MigrationRepayAsset[] => {
  const deadline = Math.floor(Date.now() / 1000 + 3600);
  return selectSelectedBorrowReservesForMigration(store, timestamp).map((userReserve) => ({
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

export const selectMigrationSignedPermits = (
  store: RootStore,
  signatures: SignatureLike[],
  deadline: BigNumberish
): {
  supplyPermits: V3MigrationHelperSignedPermit[];
  creditDelegationPermits: V3MigrationHelperSignedCreditDelegationPermit[];
} => {
  const approvalsWithSignatures = store.approvalPermitsForMigrationAssets.map((approval, index) => {
    return {
      ...approval,
      signedPermit: signatures[index],
    };
  });

  const supplyPermits: V3MigrationHelperSignedPermit[] = approvalsWithSignatures
    .filter((approval) => approval.permitType === 'SUPPLY_MIGRATOR_V3')
    .map(({ signedPermit, underlyingAsset, amount }) => ({
      deadline,
      aToken: underlyingAsset,
      value: amount,
      signedPermit,
    }));

  const creditDelegationPermits: V3MigrationHelperSignedCreditDelegationPermit[] =
    approvalsWithSignatures
      .filter((approval) => approval.permitType === 'BORROW_MIGRATOR_V3')
      .map(({ amount, signedPermit, underlyingAsset }) => ({
        deadline,
        debtToken: underlyingAsset,
        signedPermit,
        value: amount,
      }));

  return {
    supplyPermits,
    creditDelegationPermits,
  };
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

export const selectSelectedBorrowReservesForMigration = (store: RootStore, timestamp: number) => {
  const { borrowReserves } = selectUserReservesForMigration(store, timestamp);
  return borrowReserves.filter(
    (userReserve) =>
      selectMigrationSelectedBorrowIndex(store.selectedMigrationBorrowAssets, userReserve) >= 0
  );
};

export const selectSelectedBorrowReservesForMigrationV3 = (store: RootStore, timestamp: number) => {
  const { userReservesData: userReservesDataV3 } = selectV3UserSummary(store, timestamp);
  const selectedUserReserves = selectSelectedBorrowReservesForMigration(store, timestamp)
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
  const { borrowReserves: borrowReservesV3 } = selectUserReservesForMigration(
    store,
    currentTimestamp
  );

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

      const borrowAssets = store.selectedMigrationBorrowAssets
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

export const selectMigrationBorrowPermitPayloads = (
  store: RootStore,
  timestamp: number
): Approval[] => {
  const borrowUserReserves = selectSelectedBorrowReservesForMigrationV3(store, timestamp);

  const stableUserReserves: Record<string, MigrationUserReserve> = {};
  borrowUserReserves
    .filter((userReserve) => userReserve.interestRate == InterestRate.Stable)
    .forEach((item) => {
      stableUserReserves[item.underlyingAsset] = item;
    });

  return borrowUserReserves
    .filter((userReserve) => userReserve.interestRate == InterestRate.Variable)
    .map(({ increasedVariableBorrows, underlyingAsset, debtKey, reserve }) => {
      const stableUserReserve = stableUserReserves[underlyingAsset];
      let combinedIncreasedAmount = valueToBigNumber(increasedVariableBorrows);
      if (stableUserReserve) {
        const increasedStableBorrows = stableUserReserve.increasedStableBorrows;
        combinedIncreasedAmount = valueToBigNumber(increasedVariableBorrows).plus(
          valueToBigNumber(increasedStableBorrows)
        );
      }
      const combinedAmountInWei = valueToWei(combinedIncreasedAmount.toString(), reserve.decimals);
      return {
        amount: combinedAmountInWei,
        underlyingAsset: debtKey,
        permitType: 'BORROW_MIGRATOR_V3',
      };
    });
};

export const selectV3UserSummaryAfterMigration = (store: RootStore, currentTimestamp: number) => {
  const poolReserveV3Summary = selectV3UserSummary(store, currentTimestamp);
  const poolReserveV3 = selectCurrentChainIdV3PoolReserve(store);

  const supplies = selectedUserSupplyReservesForMigration(store, currentTimestamp);
  const borrows = selectSelectedBorrowReservesForMigrationV3(store, currentTimestamp);

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
      store,
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
        store.migrationExceptions[supplyUnderlyingAssetAddress]?.amount ||
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
