import { Trans } from '@lingui/macro';
import { Box, Divider, useMediaQuery, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ContentContainer } from 'src/components/ContentContainer';
import { MigrateV3Modal } from 'src/components/transactions/MigrateV3/MigrateV3Modal';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useMigrationData } from 'src/hooks/migration/useMigrationData';
import { useUserPoolReserves } from 'src/hooks/pool/useUserPoolReserves';
import { usePermissions } from 'src/hooks/usePermissions';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { DashboardContentNoData } from 'src/modules/dashboard/DashboardContentNoData';
import { MigrationBottomPanel } from 'src/modules/migration/MigrationBottomPanel';
import { MigrationListBorrowItem } from 'src/modules/migration/MigrationListBorrowItem';
import { MigrationListItem } from 'src/modules/migration/MigrationListItem';
import { MigrationListItemLoader } from 'src/modules/migration/MigrationListItemLoader';
import { MigrationLists } from 'src/modules/migration/MigrationLists';
import { MigrationTopPanel } from 'src/modules/migration/MigrationTopPanel';
import { selectCurrentChainIdV3MarketData } from 'src/store/poolSelectors';
import { useRootStore } from 'src/store/root';

export default function V3Migration() {
  const { loading } = useAppDataContext();
  const { loading: web3Loading } = useWeb3Context();
  const { isPermissionsLoading } = usePermissions();
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const currentChainIdV3MarketData = useRootStore((store) =>
    selectCurrentChainIdV3MarketData(store)
  );

  const {
    selectAllSupply,
    selectAllBorrow,
    toggleMigrationSelectedSupplyAsset: toggleSelectedSupplyPosition,
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    toggleMigrationSelectedBorrowAsset: toggleSelectedBorrowPosition,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
    resetMigrationSelectedAssets,
    enforceAsCollateral,
    getMigrationExceptionSupplyBalances,
    account: user,
  } = useRootStore();

  const {
    supplyReserves,
    borrowReserves,
    v2HealthFactorBeforeMigration,
    isolatedReserveV3,
    v2UserSummaryAfterMigration,
    v3UserSummaryBeforeMigration,
    v3UserSummaryAfterMigration,
  } = useMigrationData();

  const { data: userPoolReserveV3 } = useUserPoolReserves({
    lendingPoolAddressProvider: currentChainIdV3MarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER,
  });

  useEffect(() => {
    if (getMigrationExceptionSupplyBalances && supplyReserves.length > 0) {
      getMigrationExceptionSupplyBalances(supplyReserves);
    }
  }, [getMigrationExceptionSupplyBalances, supplyReserves]);

  useEffect(() => {
    if (resetMigrationSelectedAssets) {
      resetMigrationSelectedAssets();
    }
  }, [resetMigrationSelectedAssets]);

  const enabledAsCollateral = (canBeEnforced: boolean, underlyingAsset: string) => {
    if (canBeEnforced) {
      enforceAsCollateral(underlyingAsset);
    }
  };

  const handleToggleAllSupply = () => {
    selectAllSupply(supplyReserves);
  };

  const handleToggleAllBorrow = () => {
    selectAllBorrow(borrowReserves);
  };

  const userControlledCollateral =
    Object.keys(selectedSupplyAssets).length > 1 &&
    v3UserSummaryBeforeMigration.totalCollateralMarketReferenceCurrency == '0';

  return (
    <>
      <MigrationTopPanel />
      {user && !isPermissionsLoading ? (
        <ContentContainer>
          <MigrationLists
            loading={loading}
            onSelectAllSupplies={handleToggleAllSupply}
            onSelectAllBorrows={handleToggleAllBorrow}
            emodeCategoryId={userPoolReserveV3?.userEmodeCategoryId}
            isolatedReserveV3={isolatedReserveV3}
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
                      enableAsCollateral={() =>
                        enabledAsCollateral(reserve.canBeEnforced, reserve.underlyingAsset)
                      }
                      userControlledCollateral={userControlledCollateral}
                      canBeEnforced={
                        v3UserSummaryBeforeMigration.totalCollateralMarketReferenceCurrency ==
                          '0' && reserve.canBeEnforced
                      }
                      userReserve={reserve}
                      amount={reserve.underlyingBalance}
                      amountInUSD={reserve.underlyingBalanceUSD}
                      onCheckboxClick={() => {
                        toggleSelectedSupplyPosition(reserve.underlyingAsset);
                      }}
                      enabledAsCollateral={reserve.usageAsCollateralEnabledOnUserV3}
                      isIsolated={reserve.isolatedOnV3}
                      enteringIsolation={isolatedReserveV3?.enteringIsolationMode || false}
                      v3Rates={reserve.v3Rates}
                      disabled={reserve.migrationDisabled}
                      isSupplyList
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
                    <MigrationListBorrowItem
                      key={reserve.debtKey}
                      userReserve={reserve}
                      selectedBorrowAssets={selectedBorrowAssets}
                      toggleSelectedBorrowPosition={toggleSelectedBorrowPosition}
                      v3Rates={reserve.v3Rates}
                      enteringIsolation={isolatedReserveV3?.enteringIsolationMode || false}
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

          {!downToSM && <Divider sx={{ my: 10 }} />}

          <MigrationBottomPanel
            hfV2Current={v2HealthFactorBeforeMigration}
            hfV2AfterChange={v2UserSummaryAfterMigration.healthFactor}
            hfV3Current={v3UserSummaryBeforeMigration.healthFactor}
            v3SummaryAfterMigration={v3UserSummaryAfterMigration}
            disableButton={
              !Object.keys(selectedSupplyAssets).length && !Object.keys(selectedBorrowAssets).length
            }
            enteringIsolationMode={isolatedReserveV3?.enteringIsolationMode || false}
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
