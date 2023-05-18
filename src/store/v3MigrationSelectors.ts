import { InterestRate } from '@aave/contract-helpers';
import {
  V3MigrationHelperSignedCreditDelegationPermit,
  V3MigrationHelperSignedPermit,
} from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import { FormatReserveUSDResponse, valueToBigNumber } from '@aave/math-utils';
import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { SignatureLike } from '@ethersproject/bytes';
import { BigNumberish } from 'ethers';
import { ComputedUserReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

import { RootStore } from './root';
import { MigrationSelectedBorrowAsset } from './v3MigrationSlice';

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
  priceInUSD: string;
  ltv?: string;
  liquidationThreshold?: string;
};

export const selectSplittedBorrowsForMigration = (userReserves: ComputedUserReserveData[]) => {
  const splittedUserReserves: MigrationUserReserve[] = [];
  userReserves.forEach((userReserve) => {
    if (userReserve.stableBorrows !== '0') {
      let increasedAmount = userReserve.stableBorrows;
      if (userReserve.reserve.stableBorrowAPY == '0') {
        increasedAmount = addPercent(increasedAmount);
      } else {
        increasedAmount = add1WeekBorrowAPY(
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
        increasedAmount = add1WeekBorrowAPY(
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

export enum MigrationDisabled {
  IsolationModeBorrowDisabled,
  EModeBorrowDisabled,
  V3AssetMissing,
  InsufficientLiquidity,
  AssetNotFlashloanable,
  ReserveFrozen,
  NotEnoughtSupplies,
}

export const selectMigrationUnderlyingAssetWithExceptions = (
  store: RootStore,
  reserve: {
    underlyingAsset: string;
  }
): string => {
  const defaultUnderlyingAsset = reserve?.underlyingAsset;
  if (!store.exceptionsBalancesLoading && store.migrationExceptions[defaultUnderlyingAsset]) {
    return store.migrationExceptions[defaultUnderlyingAsset].v3UnderlyingAsset;
  }
  return defaultUnderlyingAsset;
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

export type IsolatedReserve = FormatReserveUSDResponse & { enteringIsolationMode?: boolean };

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

// adding  7 days of either stable or variable debt APY similar to swap
// https://github.com/aave/interface/blob/main/src/hooks/paraswap/common.ts#L230
const add1WeekBorrowAPY = (amount: string, borrowAPY: string) => {
  const convertedAmount = valueToBigNumber(amount);
  const convertedBorrowAPY = valueToBigNumber(borrowAPY);
  return convertedAmount
    .plus(convertedAmount.multipliedBy(convertedBorrowAPY).dividedBy(360 / 7))
    .toString();
};

export const selectIsMigrationAvailable = (store: RootStore) => {
  return Boolean(store.currentMarketData.addresses.V3_MIGRATOR);
};
