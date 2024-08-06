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
  valueToBigNumber,
} from '@aave/math-utils';
import {
  CalculateReserveIncentivesResponse,
  ReserveIncentiveResponse,
} from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { SignatureLike } from '@ethersproject/bytes';
import BigNumber from 'bignumber.js';
import { BigNumberish } from 'ethers';
import { Approval } from 'src/helpers/useTransactionHandler';
import {
  BorrowMigrationReserve,
  SupplyMigrationReserve,
  UserMigrationReserves,
} from 'src/hooks/migration/useUserMigrationReserves';
import { UserSummaryForMigration } from 'src/hooks/migration/useUserSummaryForMigration';
import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import { RootStore } from './root';
import {
  MigrationException,
  MigrationSelectedAsset,
  MigrationSelectedBorrowAsset,
} from './v3MigrationSlice';

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

export const selectMigrationSelectedSupplyIndex = (
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  underlyingAsset: string
) => {
  return selectedMigrationSupplyAssets.findIndex(
    (supplyAsset) => supplyAsset.underlyingAsset == underlyingAsset
  );
};

export const selectMigrationSelectedBorrowIndex = (
  selectedBorrowAssets: MigrationSelectedBorrowAsset[],
  borrowAsset: MigrationSelectedBorrowAsset
) => {
  return selectedBorrowAssets.findIndex((asset) => asset.debtKey == borrowAsset.debtKey);
};

export type MigrationUserReserve = FormattedUserReserves & {
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

type ReserveDebtApprovalPayload = {
  [underlyingAsset: string]: {
    variableDebtTokenAddress: string;
    decimals: number;
    stableDebtAmount: string;
    variableDebtAmount: string;
  };
};

export const selectSplittedBorrowsForMigration = (userReserves: FormattedUserReserves[]) => {
  const splittedUserReserves: MigrationUserReserve[] = [];
  userReserves.forEach((userReserve) => {
    if (userReserve.stableBorrows !== '0') {
      splittedUserReserves.push({
        ...userReserve,
        interestRate: InterestRate.Stable,
        increasedStableBorrows: userReserve.stableBorrows,
        increasedVariableBorrows: '0',
        debtKey: userReserve.reserve.stableDebtTokenAddress,
      });
    }
    if (userReserve.variableBorrows !== '0') {
      splittedUserReserves.push({
        ...userReserve,
        interestRate: InterestRate.Variable,
        increasedStableBorrows: '0',
        increasedVariableBorrows: userReserve.variableBorrows,
        debtKey: userReserve.reserve.variableDebtTokenAddress,
      });
    }
  });
  return splittedUserReserves;
};

export const selectDefinitiveSupplyAssetForMigration = (
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  migrationExceptions: Record<string, MigrationException>,
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
      supplyAsset
    );
    const v3UserReserve = userReservesV3Map[underlyingAssetAddress];
    const v3ReserveBalanceWithExceptions = selectMigrationAssetBalanceWithExceptions(
      migrationExceptions,
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
      supplyAsset
    );
    const v3UserReserve = userReservesV3Map[underlyingAssetAddress];
    const v3ReserveBalanceWithExceptions = selectMigrationAssetBalanceWithExceptions(
      migrationExceptions,
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
  InsufficientLiquidity,
  AssetNotFlashloanable,
  ReserveFrozen,
  NotEnoughtSupplies,
}

export const selectMigrationUnderlyingAssetWithExceptions = (
  migrationExceptions: Record<string, MigrationException>,
  reserve: {
    underlyingAsset: string;
  }
): string => {
  const defaultUnderlyingAsset = reserve?.underlyingAsset;
  if (migrationExceptions[defaultUnderlyingAsset]) {
    return migrationExceptions[defaultUnderlyingAsset].v3UnderlyingAsset;
  }
  return defaultUnderlyingAsset;
};

export const selectMigrationUnderluingAssetWithExceptionsByV3Key = (
  migrationExceptions: Record<string, MigrationException>,
  reserveV3: {
    underlyingAsset: string;
  }
) => {
  const exceptionItem = Object.values(migrationExceptions).find(
    (exception) => exception.v3UnderlyingAsset == reserveV3.underlyingAsset
  );
  return exceptionItem?.v2UnderlyingAsset || reserveV3.underlyingAsset;
};

export const selectMigrationAssetBalanceWithExceptions = (
  migrationExceptions: Record<string, MigrationException>,
  reserve: {
    underlyingAsset: string;
    underlyingBalance: string;
  }
) => {
  const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(
    migrationExceptions,
    reserve
  );
  const exceptionAsset = migrationExceptions[underlyingAssetAddress];
  if (exceptionAsset) {
    return exceptionAsset.amount;
  }
  return reserve.underlyingBalance;
};

export type IsolatedReserve = FormatReserveUSDResponse & { enteringIsolationMode?: boolean };

export const selectedUserSupplyReservesForMigration = (
  selectedMigrationSupplyAssets: MigrationSelectedAsset[],
  supplyReserves: SupplyMigrationReserve[],
  isolatedReserveV3: IsolatedReserve | undefined
) => {
  const selectedUserReserves = supplyReserves.filter(
    (userReserve) =>
      selectMigrationSelectedSupplyIndex(
        selectedMigrationSupplyAssets,
        userReserve.underlyingAsset
      ) >= 0
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
  supplyReserves: SupplyMigrationReserve[],
  isolatedReserveV3: IsolatedReserve | undefined
) => {
  return selectedUserSupplyReservesForMigration(
    store.selectedMigrationSupplyAssets,
    supplyReserves,
    isolatedReserveV3
  ).map((userReserve) => {
    const increasedAmount = addPercent(userReserve.underlyingBalance);
    const valueInWei = valueToWei(increasedAmount, userReserve.reserve.decimals);
    return { ...userReserve, increasedAmount: valueInWei };
  });
};

export const selectUserSupplyAssetsForMigrationNoPermit = (
  store: RootStore,
  supplyReserves: SupplyMigrationReserve[],
  isolatedReserveV3: IsolatedReserve | undefined
): MigrationSupplyAsset[] => {
  const selectedUserSupplyReserves = selectUserSupplyIncreasedReservesForMigrationPermits(
    store,
    supplyReserves,
    isolatedReserveV3
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
  borrowReserves: BorrowMigrationReserve[]
): MigrationRepayAsset[] => {
  const deadline = Math.floor(Date.now() / 1000 + 3600);
  return selectSelectedBorrowReservesForMigration(
    borrowReserves,
    store.selectedMigrationBorrowAssets
  ).map((userReserve) => ({
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

export const selectSelectedBorrowReservesForMigration = (
  borrowReserves: BorrowMigrationReserve[],
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[]
) => {
  return borrowReserves.filter(
    (userReserve) =>
      selectMigrationSelectedBorrowIndex(selectedMigrationBorrowAssets, userReserve) >= 0
  );
};

export const selectSelectedBorrowReservesForMigrationV3 = (
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[],
  toUserSummary: UserSummaryForMigration,
  userMigrationReserves: UserMigrationReserves
) => {
  const { userReservesData: userReservesDataV3 } = toUserSummary;
  const selectedUserReserves = selectSelectedBorrowReservesForMigration(
    userMigrationReserves.borrowReserves,
    selectedMigrationBorrowAssets
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

/**
 * Returns the required approval/permit payload to migrate the selected borrow reserves.
 * The amount to migrate is the sum of the variable debt and the stable debt positions for an asset.
 * Since all debt migrated to V3 becomes variable, the credit delegation approval/permit will be for the variable debt token address.
 * @param store - root store
 * @param timestamp - current timestamp
 * @returns array of approval payloads
 */
export const selectMigrationBorrowPermitPayloads = (
  store: RootStore,
  toUserSummary: UserSummaryForMigration,
  borrowReserves: BorrowMigrationReserve[],
  buffer?: boolean
): Approval[] => {
  const { userReservesData: userReservesDataV3 } = toUserSummary;
  const selectedUserReserves = selectSelectedBorrowReservesForMigration(
    borrowReserves,
    store.selectedMigrationBorrowAssets
  );

  const reserveDebts: ReserveDebtApprovalPayload = {};

  selectedUserReserves
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
    let bufferedAmount = combinedAmountInWei;
    if (buffer) {
      const amountBN = new BigNumber(bufferedAmount);
      const tenPercent = amountBN.dividedBy(10);
      bufferedAmount = amountBN.plus(tenPercent).toFixed(0);
    }

    return {
      amount: bufferedAmount,
      underlyingAsset: debt.variableDebtTokenAddress,
      permitType: 'BORROW_MIGRATOR_V3',
    };
  });
};

export const selectIsMigrationAvailable = (store: RootStore) => {
  return Boolean(store.currentMarketData.addresses.V3_MIGRATOR);
};

export type MigrationReserve = FormattedUserReserves & { migrationDisabled?: MigrationDisabled };
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
