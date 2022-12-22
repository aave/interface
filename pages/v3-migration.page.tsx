import { Trans } from '@lingui/macro';
import { Box, Divider } from '@mui/material';
import { useEffect } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ContentContainer } from 'src/components/ContentContainer';
import { MigrateV3Modal } from 'src/components/transactions/MigrateV3/MigrateV3Modal';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { usePermissions } from 'src/hooks/usePermissions';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { DashboardContentNoData } from 'src/modules/dashboard/DashboardContentNoData';
import { MigrationBottomPanel } from 'src/modules/migration/MigrationBottomPanel';
import { MigrationListItem } from 'src/modules/migration/MigrationListItem';
import { MigrationListItemLoader } from 'src/modules/migration/MigrationListItemLoader';
import { MigrationLists } from 'src/modules/migration/MigrationLists';
import { MigrationTopPanel } from 'src/modules/migration/MigrationTopPanel';
import { usePoolDataV3Subscription, useRootStore } from 'src/store/root';
import {
  selectUserReservesForMigration,
  selectV2UserSummaryAfterMigration,
  selectV3UserSummary,
  selectV3UserSummaryAfterMigration,
} from 'src/store/v3MigrationSelectors';

export default function V3Migration() {
  const { loading } = useAppDataContext();
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { isPermissionsLoading } = usePermissions();

  const currentTimeStamp = useCurrentTimestamp(5);

  const {
    totalCollateralUSD,
    totalBorrowsUSD,
    supplyReserves,
    borrowReserves,
    healthFactor: v2HealthFactorBeforeMigration,
  } = useRootStore((state) => selectUserReservesForMigration(state, currentTimeStamp));

  // health factor calculation
  const { v3UserSummaryBeforeMigration, v2UserSummaryAfterMigration, v3UserSummaryAfterMigration } =
    useRootStore((state) => ({
      v2UserSummaryAfterMigration: selectV2UserSummaryAfterMigration(state, currentTimeStamp),
      v3UserSummaryAfterMigration: selectV3UserSummaryAfterMigration(state, currentTimeStamp),
      v3UserSummaryBeforeMigration: selectV3UserSummary(state, currentTimeStamp),
    }));

  // actions
  const {
    toggleMigrationSelectedSupplyAsset: toggleSelectedSupplyPosition,
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    toggleMigrationSelectedBorrowAsset: toggleSelectedBorrowPosition,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
    setCurrentMarketForMigration,
    resetMigrationSelectedAssets,
  } = useRootStore();

  useEffect(() => {
    if (setCurrentMarketForMigration) {
      setCurrentMarketForMigration();
    }
  }, [setCurrentMarketForMigration]);

  useEffect(() => {
    if (resetMigrationSelectedAssets) {
      resetMigrationSelectedAssets();
    }
  }, [resetMigrationSelectedAssets]);

  usePoolDataV3Subscription();

  return (
    <>
      <MigrationTopPanel />
      {currentAccount && !isPermissionsLoading ? (
        <ContentContainer>
          <MigrationLists
            loading={loading}
            totalSuppliesUSD={totalCollateralUSD}
            totalBorrowsUSD={totalBorrowsUSD}
            isSupplyPositionsAvailable={supplyReserves.length > 0}
            isBorrowPositionsAvailable={borrowReserves.length > 0}
            onSelectAllSupplies={() => {
              console.log('s');
            }}
            onSelectAllBorrows={() => {
              console.log('s');
            }}
            suppliesPositions={
              <>
                {loading ? (
                  <>
                    <MigrationListItemLoader />
                    <MigrationListItemLoader />
                  </>
                ) : supplyReserves.length > 0 ? (
                  supplyReserves.map((reserve) => (
                    <MigrationListItem
                      key={reserve.underlyingAsset}
                      checked={
                        selectedSupplyAssets.findIndex(
                          (selectedAsset) =>
                            selectedAsset.underlyingAsset == reserve.underlyingAsset
                        ) >= 0
                      }
                      reserveIconSymbol={reserve.reserve.iconSymbol}
                      reserveName={reserve.reserve.name}
                      reserveSymbol={reserve.reserve.symbol}
                      amount={reserve.underlyingBalance}
                      amountInUSD={reserve.underlyingBalanceUSD}
                      onCheckboxClick={() => toggleSelectedSupplyPosition(reserve.underlyingAsset)}
                      enabledAsCollateral={reserve.usageAsCollateralEnabledOnUser}
                    />
                  ))
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DashboardContentNoData text={<Trans>Nothing supplied yet</Trans>} />
                  </Box>
                )}
              </>
            }
            borrowsPositions={
              <>
                {loading ? (
                  <>
                    <MigrationListItemLoader />
                    <MigrationListItemLoader />
                  </>
                ) : borrowReserves.length > 0 ? (
                  borrowReserves.map((reserve) => (
                    <MigrationListItem
                      key={reserve.underlyingAsset}
                      checked={
                        selectedBorrowAssets.findIndex(
                          (selectedAsset) =>
                            selectedAsset.underlyingAsset == reserve.underlyingAsset
                        ) >= 0
                      }
                      reserveIconSymbol={reserve.reserve.iconSymbol}
                      reserveName={reserve.reserve.name}
                      reserveSymbol={reserve.reserve.symbol}
                      amount={reserve.totalBorrows}
                      amountInUSD={reserve.totalBorrowsUSD}
                      onCheckboxClick={() => toggleSelectedBorrowPosition(reserve.underlyingAsset)}
                      disabled={reserve.disabledForMigration}
                      enabledAsCollateral={reserve.usageAsCollateralEnabledOnUser}
                    />
                  ))
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DashboardContentNoData text={<Trans>Nothing borrowed yet</Trans>} />
                  </Box>
                )}
              </>
            }
          />

          <Divider sx={{ my: 10 }} />

          <MigrationBottomPanel
            hfV2Current={v2HealthFactorBeforeMigration}
            hfV2AfterChange={v2UserSummaryAfterMigration.healthFactor}
            hfV3Current={v3UserSummaryBeforeMigration.healthFactor}
            hfV3AfterChange={v3UserSummaryAfterMigration.healthFactor}
            disableButton={
              !Object.keys(selectedSupplyAssets).length && !Object.keys(selectedBorrowAssets).length
            }
            loading={loading}
          />
        </ContentContainer>
      ) : (
        <ConnectWalletPaper
          loading={web3Loading}
          description={<Trans> Please connect your wallet to see migration tool.</Trans>}
        />
      )}
    </>
  );
}

V3Migration.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      <MigrateV3Modal />
    </MainLayout>
  );
};
