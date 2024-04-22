import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ContentContainer } from 'src/components/ContentContainer';
import { getMarketInfoById } from 'src/components/MarketSwitcher';
import { useUserMigrationReserves } from 'src/hooks/migration/useUserMigrationReserves';
import { useUserSummaryAfterMigration } from 'src/hooks/migration/useUserSummaryAfterMigration';
import { useUserPoolReservesHumanized } from 'src/hooks/pool/useUserPoolReserves';
import { useUserSummaryAndIncentives } from 'src/hooks/pool/useUserSummaryAndIncentives';
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
import {
  CustomMarket,
  getNetworkConfig,
  MarketDataType,
  marketsData,
} from 'src/utils/marketsAndNetworksConfig';

const MigrateV3Modal = dynamic(() =>
  import('src/components/transactions/MigrateV3/MigrateV3Modal').then(
    (module) => module.MigrateV3Modal
  )
);

const AAVE_MARKETS_TO_MIGRATE = Object.keys(marketsData)
  .map((key) => {
    const market = marketsData[key];
    return {
      ...market,
    };
  })
  .filter((market) => market.addresses.V3_MIGRATOR);

const selectableMarkets = [
  {
    title: 'Aave V2 Markets',
    markets: AAVE_MARKETS_TO_MIGRATE,
  },
];

export default function V3Migration() {
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const router = useRouter();
  const [fromMarketData, setFromMarketData] = useState<MarketDataType>(() => {
    if (router.query.market) {
      const { market } = getMarketInfoById(router.query.market as CustomMarket);
      const migrationMarket = AAVE_MARKETS_TO_MIGRATE.find(
        (migrationMarket) =>
          migrationMarket.isFork === market.isFork && migrationMarket.chainId === market.chainId
      );
      if (migrationMarket) {
        return market;
      }
    }
    return AAVE_MARKETS_TO_MIGRATE[0];
  });
  const {
    selectAllSupply,
    selectAllBorrow,
    toggleMigrationSelectedSupplyAsset: toggleSelectedSupplyPosition,
    selectedMigrationSupplyAssets: selectedSupplyAssets,
    toggleMigrationSelectedBorrowAsset: toggleSelectedBorrowPosition,
    selectedMigrationBorrowAssets: selectedBorrowAssets,
    resetMigrationSelectedAssets,
    enforceAsCollateral,
  } = useRootStore();

  const toMarketData = selectCurrentChainIdV3MarketData(
    fromMarketData.chainId,
    getNetworkConfig(fromMarketData.chainId)
  );

  const { data: userMigrationReserves, isLoading: userMigrationReservesLoading } =
    useUserMigrationReserves(fromMarketData, toMarketData);

  const supplyReserves = userMigrationReserves?.supplyReserves || [];
  const borrowReserves = userMigrationReserves?.borrowReserves || [];
  const isolatedReserveV3 = userMigrationReserves?.isolatedReserveV3;

  const { data: fromUserSummaryAndIncentives, isLoading: fromUserSummaryAndIncentivesLoading } =
    useUserSummaryAndIncentives(fromMarketData);

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
    selectedSupplyAssets.length > 1 &&
    toUserSummaryForMigration &&
    toUserSummaryForMigration.totalCollateralMarketReferenceCurrency == '0';

  const changeFromMarketData = (marketData: MarketDataType) => {
    resetMigrationSelectedAssets();
    setFromMarketData(marketData);
  };

  const bottomPanelProps = fromUserSummaryAndIncentives &&
    toUserSummaryForMigration && {
      fromUserSummaryBeforeMigration: fromUserSummaryAndIncentives,
      toUserSummaryBeforeMigration: toUserSummaryForMigration,
    };

  return (
    <>
      <MigrationTopPanel />
      {currentAccount ? (
        <ContentContainer>
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              alignItems: 'start',
              flexDirection: { xs: 'column', lg: 'row' },
            }}
          >
            <MigrationBottomPanel
              userSummaryAfterMigration={userSummaryAfterMigration}
              userSummaryBeforeMigration={bottomPanelProps}
              disableButton={selectedSupplyAssets.length === 0 && selectedBorrowAssets.length === 0}
              enteringIsolationMode={isolatedReserveV3?.enteringIsolationMode || false}
              loading={loading}
              fromMarketData={fromMarketData}
              toMarketData={toMarketData}
              setFromMarketData={changeFromMarketData}
              selectableMarkets={selectableMarkets}
            />
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
          </Box>
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
