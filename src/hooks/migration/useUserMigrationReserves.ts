import {
  ReservesDataHumanized,
  ReservesIncentiveDataHumanized,
  valueToWei,
} from '@aave/contract-helpers';
import { ComputedUserReserve, valueToBigNumber } from '@aave/math-utils';
import dayjs from 'dayjs';
import memoize from 'micro-memoize';
import { UserReservesDataHumanized } from 'src/services/UIPoolService';
import { useRootStore } from 'src/store/root';
import {
  IsolatedReserve,
  MigrationDisabled,
  MigrationUserReserve,
  selectDefinitiveSupplyAssetForMigration,
  selectFormatUserSummaryForMigration,
  selectIsolationModeForMigration,
  selectMigrationUnderlyingAssetWithExceptions,
  selectSplittedBorrowsForMigration,
  selectUserReservesMapFromUserReserves,
  V3Rates,
} from 'src/store/v3MigrationSelectors';
import { MigrationException, MigrationSelectedAsset } from 'src/store/v3MigrationSlice';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { FormattedReservesAndIncentives } from '../pool/usePoolFormattedReserves';
import { usePoolReservesHumanized } from '../pool/usePoolReserves';
import { usePoolReservesIncentivesHumanized } from '../pool/usePoolReservesIncentives';
import { useUserPoolReservesHumanized } from '../pool/useUserPoolReserves';
import {
  UserSummaryAndIncentives,
  useUserSummaryAndIncentives,
} from '../pool/useUserSummaryAndIncentives';
import { combineQueries, SimplifiedUseQueryResult } from '../pool/utils';
import { useMigrationExceptionsSupplyBalance } from './useMigrationExceptionsSupplyBalance';

export type SupplyMigrationReserve = ComputedUserReserve<FormattedReservesAndIncentives> & {
  usageAsCollateralEnabledOnUserV3: boolean;
  isolatedOnV3: boolean;
  canBeEnforced: boolean;
  migrationDisabled?: MigrationDisabled;
  v3Rates?: V3Rates;
};

export type BorrowMigrationReserve = MigrationUserReserve & {
  v3Rates?: V3Rates;
  migrationDisabled?: MigrationDisabled;
};

export interface UserMigrationReserves {
  totalCollateralUSD: string;
  totalBorrowsUSD: string;
  healthFactor: string;
  supplyReserves: SupplyMigrationReserve[];
  borrowReserves: BorrowMigrationReserve[];
  isolatedReserveV3?: IsolatedReserve;
}

const select = memoize(
  (
    toReservesData: ReservesDataHumanized,
    toUserReservesData: UserReservesDataHumanized,
    toReservesIncentivesData: ReservesIncentiveDataHumanized[],
    fromUserSummaryAndIncentives: UserSummaryAndIncentives,
    migrationExceptions: Record<string, MigrationException>,
    selectedMigrationSupplyAssets: MigrationSelectedAsset[]
  ): UserMigrationReserves => {
    const { userReservesData: userReserveV3Data, ...v3ReservesUserSummary } =
      selectFormatUserSummaryForMigration(
        toReservesData.reservesData,
        toReservesIncentivesData,
        toUserReservesData.userReserves,
        toReservesData.baseCurrencyData,
        dayjs().unix(),
        toUserReservesData.userEmodeCategoryId
      );

    const { userReservesData: userReservesV2Data, ...v2ReservesUserSummary } =
      fromUserSummaryAndIncentives;

    const userEmodeCategoryId = toUserReservesData.userEmodeCategoryId;

    let isolatedReserveV3: IsolatedReserve | undefined =
      selectIsolationModeForMigration(v3ReservesUserSummary);

    const v3ReservesMap = selectUserReservesMapFromUserReserves(userReserveV3Data);

    if (v3ReservesUserSummary.totalCollateralMarketReferenceCurrency == '0') {
      const definitiveAssets = selectDefinitiveSupplyAssetForMigration(
        selectedMigrationSupplyAssets,
        migrationExceptions,
        v3ReservesMap
      );
      if (definitiveAssets.length > 0) {
        const underlyingAssetAddress = selectMigrationUnderlyingAssetWithExceptions(
          migrationExceptions,
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
        migrationExceptions,
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

    const result = {
      totalCollateralUSD: v2ReservesUserSummary.totalCollateralUSD,
      totalBorrowsUSD: v2ReservesUserSummary.totalBorrowsUSD,
      healthFactor: v2ReservesUserSummary.healthFactor,
      borrowReserves: mappedBorrowReserves,
      supplyReserves: mappedSupplyReserves,
      isolatedReserveV3,
    };
    return result;
  }
);

export const useUserMigrationReserves = (
  migrationFrom: MarketDataType,
  migrationTo: MarketDataType
): SimplifiedUseQueryResult<UserMigrationReserves> => {
  const toReservesDataQuery = usePoolReservesHumanized(migrationTo);
  const toUserReservesDataQuery = useUserPoolReservesHumanized(migrationTo);
  const toReservesIncentivesDataQuery = usePoolReservesIncentivesHumanized(migrationTo);
  const fromUserSummaryAndIncentives = useUserSummaryAndIncentives(migrationFrom);

  const userReservesV2Data = fromUserSummaryAndIncentives.data?.userReservesData;

  const supplyReserves = userReservesV2Data?.filter(
    (userReserve) => userReserve.underlyingBalance !== '0'
  );

  const migrationsExceptionsQuery = useMigrationExceptionsSupplyBalance(
    migrationFrom,
    migrationTo,
    supplyReserves
  );

  const selectedMigrationSupplyAssets = useRootStore(
    (store) => store.selectedMigrationSupplyAssets
  );

  const selector = (
    toReservesData: ReservesDataHumanized,
    toUserReservesData: UserReservesDataHumanized,
    toReservesIncentivesData: ReservesIncentiveDataHumanized[],
    fromUserSummaryAndIncentives: UserSummaryAndIncentives,
    migrationsExceptions: Record<string, MigrationException>
  ) => {
    return select(
      toReservesData,
      toUserReservesData,
      toReservesIncentivesData,
      fromUserSummaryAndIncentives,
      migrationsExceptions,
      selectedMigrationSupplyAssets
    );
  };

  return combineQueries(
    [
      toReservesDataQuery,
      toUserReservesDataQuery,
      toReservesIncentivesDataQuery,
      fromUserSummaryAndIncentives,
      migrationsExceptionsQuery,
    ] as const,
    selector
  );
};
