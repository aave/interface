import { InterestRate, valueToWei } from '@aave/contract-helpers';
import { rayDiv, valueToBigNumber } from '@aave/math-utils';
import dayjs from 'dayjs';
import memoize from 'micro-memoize';
import { selectFormatBaseCurrencyData } from 'src/store/poolSelectors';
import { PoolReserve } from 'src/store/poolSlice';
import { useRootStore } from 'src/store/root';
import {
  selectedUserSupplyReservesForMigration,
  selectFormatUserSummaryForMigration,
  selectMigrationSelectedSupplyIndex,
  selectMigrationUnderluingAssetWithExceptionsByV3Key,
  selectSelectedBorrowReservesForMigrationV3,
} from 'src/store/v3MigrationSelectors';
import {
  MigrationException,
  MigrationSelectedAsset,
  MigrationSelectedBorrowAsset,
} from 'src/store/v3MigrationSlice';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { combineQueries, SimplifiedUseQueryResult } from '../pool/utils';
import { useMigrationExceptionsSupplyBalance } from './useMigrationExceptionsSupplyBalance';
import { usePoolReserve } from './usePoolReserve';
import { UserMigrationReserves, useUserMigrationReserves } from './useUserMigrationReserves';
import { UserSummaryForMigration, useUserSummaryForMigration } from './useUserSummaryForMigration';

export interface UserSummaryAfterMigration {
  fromUserSummaryAfterMigration: UserSummaryForMigration;
  toUserSummaryAfterMigration: {
    healthFactor: string;
    currentLoanToValue: string;
    totalCollateralMarketReferenceCurrency: string;
    totalBorrowsMarketReferenceCurrency: string;
  };
}

const select = memoize(
  (
    userMigrationReserves: UserMigrationReserves,
    fromPoolReserve: PoolReserve,
    toPoolReserve: PoolReserve,
    toUserSummary: UserSummaryForMigration,
    selectedMigrationSupplyAssets: MigrationSelectedAsset[],
    selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[],
    migrationExceptions: Record<string, MigrationException>
  ) => {
    const borrowReservesV3 = userMigrationReserves.borrowReserves;

    const userReservesFrom =
      fromPoolReserve?.userReserves?.map((userReserve) => {
        let scaledATokenBalance = userReserve.scaledATokenBalance;
        let principalStableDebt = userReserve.principalStableDebt;
        let scaledVariableDebt = userReserve.scaledVariableDebt;

        const isSupplyAsset =
          selectMigrationSelectedSupplyIndex(
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
              (borrowReserveV3) =>
                borrowReserveV3.underlyingAsset == borrowReserveV2.underlyingAsset
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

    const fromBaseCurrencyData = selectFormatBaseCurrencyData(fromPoolReserve);

    const fromUserSummaryAfterMigration = selectFormatUserSummaryForMigration(
      fromPoolReserve?.reserves,
      fromPoolReserve?.reserveIncentives,
      userReservesFrom,
      fromBaseCurrencyData,
      dayjs().unix(),
      fromPoolReserve?.userEmodeCategoryId
    );
    //TODO: refactor that to be more efficient

    const supplies = selectedUserSupplyReservesForMigration(
      selectedMigrationSupplyAssets,
      userMigrationReserves.supplyReserves,
      userMigrationReserves.isolatedReserveV3
    );
    const borrows = selectSelectedBorrowReservesForMigrationV3(
      selectedMigrationBorrowAssets,
      toUserSummary,
      userMigrationReserves
    );

    const suppliesMap = supplies.reduce((obj, item) => {
      obj[item.underlyingAsset] = item;
      return obj;
    }, {} as Record<string, typeof userMigrationReserves.supplyReserves[0]>);

    const borrowsMap = borrows.reduce((obj, item) => {
      obj[item.debtKey] = item;
      return obj;
    }, {} as Record<string, typeof userMigrationReserves.borrowReserves[0]>);

    const userReserves = toUserSummary.userReservesData.map((userReserveData) => {
      const stableBorrowAsset = borrowsMap[userReserveData.reserve.stableDebtTokenAddress];
      const variableBorrowAsset = borrowsMap[userReserveData.reserve.variableDebtTokenAddress];

      const supplyUnderlyingAssetAddress = selectMigrationUnderluingAssetWithExceptionsByV3Key(
        migrationExceptions,
        userReserveData
      );
      const supplyAsset = suppliesMap[supplyUnderlyingAssetAddress];

      let combinedScaledDownVariableDebtV3 = userReserveData.scaledVariableDebt;
      let combinedScaledDownABalance = userReserveData.scaledATokenBalance;
      let usageAsCollateralEnabledOnUser = userReserveData.usageAsCollateralEnabledOnUser;
      const variableBorrowIndexV3 = valueToBigNumber(userReserveData.reserve.variableBorrowIndex);

      if (variableBorrowAsset && variableBorrowAsset.migrationDisabled === undefined) {
        const scaledDownVariableDebtV2Balance = rayDiv(
          valueToWei(
            variableBorrowAsset.increasedVariableBorrows,
            userReserveData.reserve.decimals
          ),
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
          migrationExceptions[supplyUnderlyingAssetAddress]?.amount ||
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

    const toBaseCurrencyData = selectFormatBaseCurrencyData(toPoolReserve);

    const formattedUserSummary = selectFormatUserSummaryForMigration(
      toPoolReserve?.reserves,
      toPoolReserve?.reserveIncentives,
      userReserves,
      toBaseCurrencyData,
      dayjs().unix(),
      toPoolReserve?.userEmodeCategoryId
    );
    // return the smallest object possible for migration page
    const toUserSummaryAfterMigration = {
      healthFactor: formattedUserSummary.healthFactor,
      currentLoanToValue: formattedUserSummary.currentLoanToValue,
      totalCollateralMarketReferenceCurrency:
        formattedUserSummary.totalCollateralMarketReferenceCurrency,
      totalBorrowsMarketReferenceCurrency: formattedUserSummary.totalBorrowsMarketReferenceCurrency,
    };

    return {
      fromUserSummaryAfterMigration,
      toUserSummaryAfterMigration,
    };
  }
);

export const useUserSummaryAfterMigration = (
  fromMarket: MarketDataType,
  toMarket: MarketDataType
): SimplifiedUseQueryResult<UserSummaryAfterMigration> => {
  const userMigrationReservesQuery = useUserMigrationReserves(fromMarket, toMarket);
  const toUserSummary = useUserSummaryForMigration(toMarket);
  const fromPoolReserve = usePoolReserve(fromMarket);
  const toPoolReserve = usePoolReserve(toMarket);
  const migrationExceptionsQuery = useMigrationExceptionsSupplyBalance(
    fromMarket,
    toMarket,
    userMigrationReservesQuery.data?.supplyReserves
  );

  const selectedMigrationBorrowAssets = useRootStore(
    (store) => store.selectedMigrationBorrowAssets
  );
  const selectedMigrationSupplyAssets = useRootStore(
    (store) => store.selectedMigrationSupplyAssets
  );

  const selector = (
    userMigrationReserves: UserMigrationReserves,
    fromPoolReserve: PoolReserve,
    toPoolReserve: PoolReserve,
    toUserSummary: UserSummaryForMigration,
    migrationExceptions: Record<string, MigrationException>
  ) => {
    return select(
      userMigrationReserves,
      fromPoolReserve,
      toPoolReserve,
      toUserSummary,
      selectedMigrationSupplyAssets,
      selectedMigrationBorrowAssets,
      migrationExceptions
    );
  };

  return combineQueries(
    [
      userMigrationReservesQuery,
      fromPoolReserve,
      toPoolReserve,
      toUserSummary,
      migrationExceptionsQuery,
    ] as const,
    selector
  );
};
