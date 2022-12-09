import { Trans } from '@lingui/macro';
import { Box, Divider } from '@mui/material';
import { useEffect } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ContentContainer } from 'src/components/ContentContainer';
import { MigrateV3Modal } from 'src/components/transactions/MigrateV3/MigrateV3Modal';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
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
import {
  selectV2UserSummaryAfterMigration,
  selectV3UserSummary,
  selectV3UserSummaryAfterMigration,
} from 'src/store/v3MigrationSelectors';

export default function V3Migration() {
  const { loading } = useAppDataContext();
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { isPermissionsLoading } = usePermissions();
  const setCurrentMarketForMigration = useRootStore((state) => state.setCurrentMarketForMigration);

  const currentTimeStamp = useCurrentTimestamp(5);

  const v2UserSummaryAfterMigration = useRootStore((state) =>
    selectV2UserSummaryAfterMigration(state, currentTimeStamp)
  );

  const v3UserSummaryAfterMigration = useRootStore((state) =>
    selectV3UserSummaryAfterMigration(state, currentTimeStamp)
  );

  const v3UserSummaryBeforeMigration = useRootStore((state) =>
    selectV3UserSummary(state, currentTimeStamp)
  );

  const { user, borrowPositions } = useUserReserves();

  const {
    toggleMigrationSelectedSupplyAsset: toggleSelectedSupplyPosition,
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    toggleMigrationSelectedBorrowAsset: toggleSelectedBorrowPosition,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
  } = useRootStore();

  useEffect(() => {
    if (setCurrentMarketForMigration) {
      setCurrentMarketForMigration();
    }
  }, [setCurrentMarketForMigration]);

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
            hfV2Current={user.healthFactor}
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
