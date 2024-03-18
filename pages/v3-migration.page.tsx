import { Trans } from '@lingui/macro';
import { Box, Divider, useMediaQuery, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ContentContainer } from 'src/components/ContentContainer';
import { useUserMigrationReserves } from 'src/hooks/migration/useUserMigrationReserves';
import { useUserSummaryAfterMigration } from 'src/hooks/migration/useUserSummaryAfterMigration';
import { useUserPoolReservesHumanized } from 'src/hooks/pool/useUserPoolReserves';
import { useUserSummaryAndIncentives } from 'src/hooks/pool/useUserSummaryAndIncentives';
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

const MigrateV3Modal = dynamic(() =>
  import('src/components/transactions/MigrateV3/MigrateV3Modal').then(
    (module) => module.MigrateV3Modal
  )
);

export default function V3Migration() {
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const currentChainId = useRootStore((store) => store.currentChainId);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentMarketData = useRootStore((store) => store.currentMarketData);
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
  } = useRootStore();

  const { isPermissionsLoading } = usePermissions();
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const toMarketData = selectCurrentChainIdV3MarketData(currentChainId, currentNetworkConfig);
  const fromMarketData = currentMarketData;

  const { data: userMigrationReserves, isLoading: userMigrationReservesLoading } =
    useUserMigrationReserves(currentMarketData, toMarketData);

  const supplyReserves = useMemo(
    () => userMigrationReserves?.supplyReserves || [],
    [userMigrationReserves]
  );
  const borrowReserves = userMigrationReserves?.borrowReserves || [];
  const isolatedReserveV3 = userMigrationReserves?.isolatedReserveV3;

  const { data: fromUserSummaryAndIncentives, isLoading: fromUserSummaryAndIncentivesLoading } =
    useUserSummaryAndIncentives(fromMarketData);
  const fromHealthFactor = fromUserSummaryAndIncentives?.healthFactor || '0';

  const { data: toUserReservesData, isLoading: toUserReservesDataLoading } =
    useUserPoolReservesHumanized(toMarketData);
  const { data: toUserSummaryForMigration, isLoading: toUserSummaryForMigrationLoading } =
    useUserSummaryAndIncentives(toMarketData);
  const toUserEModeCategoryId = toUserReservesData?.userEmodeCategoryId || 0;

  const { data: userSummaryAfterMigration, isLoading: userSummaryAfterMigrationLoading } =
    useUserSummaryAfterMigration(fromMarketData, toMarketData);

  const loading =
    userMigrationReservesLoading ||
    fromUserSummaryAndIncentivesLoading ||
    toUserReservesDataLoading ||
    toUserSummaryForMigrationLoading ||
    userSummaryAfterMigrationLoading;

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
    toUserSummaryForMigration &&
    toUserSummaryForMigration.totalCollateralMarketReferenceCurrency == '0';

  return (
    <>
      <MigrationTopPanel />
      {currentAccount && !isPermissionsLoading ? (
        <ContentContainer>
          <MigrationLists
            loading={loading}
            isSupplyPositionsAvailable={supplyReserves.length > 0}
            isBorrowPositionsAvailable={borrowReserves.length > 0}
            onSelectAllSupplies={handleToggleAllSupply}
            onSelectAllBorrows={handleToggleAllBorrow}
            emodeCategoryId={toUserEModeCategoryId}
            isolatedReserveV3={isolatedReserveV3}
            supplyReserves={supplyReserves}
            borrowReserves={borrowReserves}
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
                        toUserSummaryForMigration &&
                        toUserSummaryForMigration.totalCollateralMarketReferenceCurrency == '0' &&
                        reserve.canBeEnforced
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

          {userSummaryAfterMigration && (
            <MigrationBottomPanel
              hfV2Current={fromHealthFactor}
              hfV2AfterChange={userSummaryAfterMigration.fromUserSummaryAfterMigration.healthFactor}
              hfV3Current={toUserSummaryForMigration?.healthFactor || '0'}
              v3SummaryAfterMigration={userSummaryAfterMigration.toUserSummaryAfterMigration}
              disableButton={
                !Object.keys(selectedSupplyAssets).length &&
                !Object.keys(selectedBorrowAssets).length
              }
              enteringIsolationMode={isolatedReserveV3?.enteringIsolationMode || false}
              loading={loading}
            />
          )}
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
