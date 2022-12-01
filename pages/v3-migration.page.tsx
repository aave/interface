import { Trans } from '@lingui/macro';
import { Box, Divider } from '@mui/material';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ContentContainer } from 'src/components/ContentContainer';
import { MigrateV3Modal } from 'src/components/transactions/MigrateV3/MigrateV3Modal';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { usePermissions } from 'src/hooks/usePermissions';
import { useUserReserves } from 'src/hooks/useUserReserves';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { DashboardContentNoData } from 'src/modules/dashboard/DashboardContentNoData';
import { MigrationBottomPanel } from 'src/modules/migration/MigrationBottomPanel';
import { MigrationListItem } from 'src/modules/migration/MigrationListItem';
import { MigrationListItemLoader } from 'src/modules/migration/MigrationListItemLoader';
import { MigrationLists } from 'src/modules/migration/MigrationLists';
import { MigrationTopPanel } from 'src/modules/migration/MigrationTopPanel';
import { usePoolDataV3Subscription, useRootStore } from 'src/store/root';

export default function V3Migration() {
  const { loading } = useAppDataContext();
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { isPermissionsLoading } = usePermissions();

  const { user, borrowPositions } = useUserReserves();

  const {
    toggleMigrationSelectedSupplyAsset: toggleSelectedSupplyPosition,
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    toggleMigrationSelectedBorrowAsset: toggleSelectedBorrowPosition,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
  } = useRootStore();

  // start refreshing v3 market at the same time
  usePoolDataV3Subscription();

  return (
    <>
      <MigrationTopPanel />

      {currentAccount && !isPermissionsLoading ? (
        <ContentContainer>
          <MigrationLists
            loading={loading}
            totalSuppliesUSD={user.totalCollateralUSD}
            totalBorrowsUSD={user.totalBorrowsUSD}
            isSupplyPositionsAvailable={!!user.userReservesData.length}
            isBorrowPositionsAvailable={!!borrowPositions.length}
            onSelectAllSupplies={() =>
              user.userReservesData.map((reserve) =>
                toggleSelectedSupplyPosition(reserve.underlyingAsset)
              )
            }
            onSelectAllBorrows={() =>
              borrowPositions.map((reserve) =>
                toggleSelectedBorrowPosition(reserve.underlyingAsset)
              )
            }
            suppliesPositions={
              <>
                {loading ? (
                  <>
                    <MigrationListItemLoader />
                    <MigrationListItemLoader />
                  </>
                ) : !!user.userReservesData.length ? (
                  user.userReservesData.map((reserve) => (
                    <MigrationListItem
                      key={reserve.underlyingAsset}
                      checked={selectedSupplyAssets[reserve.underlyingAsset]}
                      reserveIconSymbol={reserve.reserve.iconSymbol}
                      reserveName={reserve.reserve.name}
                      reserveSymbol={reserve.reserve.symbol}
                      amount={reserve.underlyingBalance}
                      amountInUSD={reserve.underlyingBalanceUSD}
                      onCheckboxClick={() => toggleSelectedSupplyPosition(reserve.underlyingAsset)}
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
                ) : !!borrowPositions.length ? (
                  borrowPositions.map((reserve) => (
                    <MigrationListItem
                      key={reserve.underlyingAsset}
                      checked={selectedBorrowAssets[reserve.underlyingAsset]}
                      reserveIconSymbol={reserve.reserve.iconSymbol}
                      reserveName={reserve.reserve.name}
                      reserveSymbol={reserve.reserve.symbol}
                      amount={reserve.totalBorrows}
                      amountInUSD={reserve.totalBorrowsUSD}
                      onCheckboxClick={() => toggleSelectedBorrowPosition(reserve.underlyingAsset)}
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
            hfV2Current={'1.2'} // TODO: need value
            hfV2AfterChange={'2'} // TODO: need value
            hfV3Current={'1.2'} // TODO: need value
            hfV3AfterChange={'2'} // TODO: need value
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
