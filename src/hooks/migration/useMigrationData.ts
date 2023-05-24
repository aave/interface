import { Approval } from 'src/helpers/useTransactionHandler';
import {
  getMigrationBorrowPermitPayloads,
  getMigrationRepayAssets,
  getPoolUserSummary,
  getSelectedBorrowReservesForMigration,
  getSelectedBorrowReservesForMigrationV3,
  getUserReservesForMigration,
  getUserSupplyAssetsForMigrationNoPermit,
  getUserSupplyIncreasedReservesForMigrationPermits,
  getUserSupplyReservesForMigration,
  getV2UserSummaryAfterMigration,
  getV3UserSummaryAfterMigration,
} from 'src/store/migrationFormatters';
import {
  selectCurrentChainIdV2MarketData,
  selectCurrentChainIdV3MarketData,
} from 'src/store/poolSelectors';
import { useRootStore } from 'src/store/root';

import { useReserveIncentiveData } from '../incentive/useReserveIncentiveData';
import { useUserIncentiveData } from '../incentive/useUserIncentiveData';
import { usePoolReserves } from '../pool/usePoolReserves';
import { useUserPoolReserves } from '../pool/useUserPoolReserves';
import { useCurrentTimestamp } from '../useCurrentTimestamp';

export const useMigrationData = () => {
  const currentTimeStamp = useCurrentTimestamp(10);

  const {
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
  } = useRootStore();

  const currentChainIdV3MarketData = useRootStore((store) =>
    selectCurrentChainIdV3MarketData(store)
  );
  const currentChainIdV2MarketData = useRootStore((store) =>
    selectCurrentChainIdV2MarketData(store)
  );

  const { data: userPoolReserveV3 } = useUserPoolReserves(currentChainIdV3MarketData);

  const { data: userPoolReserveV2 } = useUserPoolReserves(currentChainIdV2MarketData);

  const { data: poolReserveV3 } = usePoolReserves(currentChainIdV3MarketData);

  const { data: poolReserveV2 } = usePoolReserves(currentChainIdV2MarketData);

  const { data: v2UserIncentiveData } = useUserIncentiveData(currentChainIdV2MarketData);

  const { data: v3ReserveIncentiveData } = useReserveIncentiveData(currentChainIdV3MarketData);

  const { data: v2ReserveIncentiveData } = useReserveIncentiveData(currentChainIdV2MarketData);

  const poolReserveV3Data = {
    reserves: poolReserveV3?.reservesData,
    reserveIncentive: v3ReserveIncentiveData,
    baseCurrencyData: poolReserveV3?.baseCurrencyData,
    userEmodeCategoryId: userPoolReserveV3?.userEmodeCategoryId,
    userReserves: userPoolReserveV3?.userReserves,
  };

  const poolReserveV2Data = {
    reserves: poolReserveV2?.reservesData,
    reserveIncentive: v2ReserveIncentiveData,
    baseCurrencyData: poolReserveV2?.baseCurrencyData,
    userEmodeCategoryId: userPoolReserveV2?.userEmodeCategoryId,
    userReserves: userPoolReserveV2?.userReserves,
  };

  const {
    supplyReserves,
    borrowReserves,
    healthFactor: v2HealthFactorBeforeMigration,
    isolatedReserveV3,
  } = getUserReservesForMigration(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  );

  const v2UserSummaryAfterMigration = getV2UserSummaryAfterMigration(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    selectedBorrowAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  );

  const v3UserSummaryBeforeMigration = getPoolUserSummary(poolReserveV3Data, currentTimeStamp);

  const v3UserSummaryAfterMigration = getV3UserSummaryAfterMigration(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    selectedBorrowAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  );

  const borrowPermitPayloads = getMigrationBorrowPermitPayloads(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    selectedBorrowAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  );

  const supplyPermitPayloads = getUserSupplyIncreasedReservesForMigrationPermits(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  ).map(({ reserve, increasedAmount }): Approval => {
    return {
      amount: increasedAmount,
      underlyingAsset: reserve.aTokenAddress,
      permitType: 'SUPPLY_MIGRATOR_V3',
    };
  });

  const selectedBorrowReserves = getSelectedBorrowReservesForMigration(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    selectedBorrowAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  );

  const selectedBorrowReservesV3 = getSelectedBorrowReservesForMigrationV3(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    selectedBorrowAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  );

  const selectedSupplyReserves = getUserSupplyReservesForMigration(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  );

  const supplyAssetsNoPermit = getUserSupplyAssetsForMigrationNoPermit(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  );

  const repayAssets = getMigrationRepayAssets(
    poolReserveV3Data,
    poolReserveV2Data,
    v2UserIncentiveData || [],
    v2ReserveIncentiveData || [],
    selectedSupplyAssets,
    selectedBorrowAssets,
    migrationExceptions,
    exceptionsBalancesLoading,
    currentNetworkConfig,
    currentTimeStamp
  );

  return {
    supplyReserves,
    borrowReserves,
    selectedBorrowReserves,
    v2HealthFactorBeforeMigration,
    isolatedReserveV3,
    v2UserSummaryAfterMigration,
    v3UserSummaryBeforeMigration,
    v3UserSummaryAfterMigration,
    borrowPermitPayloads,
    supplyPermitPayloads,
    supplyAssetsNoPermit,
    repayAssets,
    selectedBorrowReservesV3,
    selectedSupplyReserves,
  };
};
