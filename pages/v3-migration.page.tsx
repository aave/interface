import { Divider } from '@mui/material';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MigrateV3Modal } from 'src/components/transactions/MigrateV3/MigrateV3Modal';
import { useModalContext } from 'src/hooks/useModal';
import { useUserReserves } from 'src/hooks/useUserReserves';
import { MainLayout } from 'src/layouts/MainLayout';
import { MigrationListItem } from 'src/modules/migration/MigrationListItem';
import { MigrationLists } from 'src/modules/migration/MigrationLists';
import { MigrationTopPanel } from 'src/modules/migration/MigrationTopPanel';
import { usePoolDataV3Subscription, useRootStore } from 'src/store/root';

import { MigrationBottomPanel } from '../src/modules/migration/MigrationBottomPanel';

export default function V3Migration() {
  const { user, borrowPositions } = useUserReserves();
  const { openV3Migration } = useModalContext();

  const toggleSelectedSupplyPosition = useRootStore(
    (state) => state.toggleMigrationSelectedSupplyAsset
  );
  const selectedSupplyAssets = useRootStore((state) => state.selectedMigrationSupplyAssets);

  const toggleSelectedBorrowPosition = useRootStore(
    (state) => state.toggleMigrationSelectedBorrowAsset
  );
  const selectedBorrowAssets = useRootStore((state) => state.selectedMigrationBorrowAssets);
  const testMigration = useRootStore((state) => state._testMigration);

  // const currentTimestamp = useCurrentTimestamp(5);
  // const currentV2SuppliedPositions = useRootStore((state) =>
  //   selectCurrentMarketV2Reserves(state, currentTimestamp)
  // );

  // start refreshing v3 market at the same time
  usePoolDataV3Subscription();

  // always switch to default v2 in that case for polygon fork
  useEffect(() => {}, []);

  return (
    <>
      <MigrationTopPanel />
      <ContentContainer>
        <MigrationLists
          totalSuppliesUSD={user.totalCollateralUSD}
          totalBorrowsUSD={user.totalBorrowsUSD}
          onSelectAllSupplies={() =>
            user.userReservesData.map((reserve) =>
              toggleSelectedSupplyPosition(reserve.underlyingAsset)
            )
          }
          onSelectAllBorrows={() =>
            borrowPositions.map((reserve) => toggleSelectedBorrowPosition(reserve.underlyingAsset))
          }
          suppliesPositions={
            <>
              {user.userReservesData.map((reserve) => (
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
              ))}
            </>
          }
          borrowsPositions={
            <>
              {borrowPositions.map((reserve) => (
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
              ))}
            </>
          }
        />

        <Divider sx={{ my: 10 }} />

        <MigrationBottomPanel
          hfV2Current={'1.2'} // TODO: need value
          hfV2AfterChange={'2'} // TODO: need value
          hfV3Current={'1.2'} // TODO: need value
          hfV3AfterChange={'2'} // TODO: need value
        />
      </ContentContainer>

      <div>
        <button onClick={() => testMigration()}>test migration</button>
        <div>supply</div>
        {user.userReservesData.map((reserve) => (
          <button
            key={reserve.underlyingAsset}
            onClick={() => toggleSelectedSupplyPosition(reserve.underlyingAsset)}
            style={{ color: selectedSupplyAssets[reserve.underlyingAsset] ? 'red' : 'black' }}
          >
            {reserve.underlyingAsset}:<b>{reserve.scaledATokenBalance}</b>
          </button>
        ))}
        <div>borrow</div>
        {borrowPositions.map((reserve) => (
          <button
            key={reserve.underlyingAsset}
            onClick={() => toggleSelectedBorrowPosition(reserve.underlyingAsset)}
            style={{ color: selectedBorrowAssets[reserve.underlyingAsset] ? 'red' : 'black' }}
          >
            {reserve.variableBorrowsUSD}
          </button>
        ))}
        <button onClick={openV3Migration}>Migrate</button>
      </div>
    </>
  );
}

V3Migration.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      {/** Modals */}
      <MigrateV3Modal />
      {/** End of modals */}
    </MainLayout>
  );
};
