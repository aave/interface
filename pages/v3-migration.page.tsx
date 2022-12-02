import { useEffect } from 'react';
import { MigrateV3Modal } from 'src/components/transactions/MigrateV3/MigrateV3Modal';
import { StakeModal } from 'src/components/transactions/Stake/StakeModal';
import { StakeCooldownModal } from 'src/components/transactions/StakeCooldown/StakeCooldownModal';
import { StakeRewardClaimModal } from 'src/components/transactions/StakeRewardClaim/StakeRewardClaimModal';
import { UnStakeModal } from 'src/components/transactions/UnStake/UnStakeModal';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { useUserReserves } from 'src/hooks/useUserReserves';
import { MainLayout } from 'src/layouts/MainLayout';
import { usePoolDataV3Subscription, useRootStore } from 'src/store/root';
import { selectCurrentMarketV2Reserves } from 'src/store/v3MigrationSelectors';

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

  const currentTimestamp = useCurrentTimestamp(5);
  const currentV2SuppliedPositions = useRootStore((state) =>
    selectCurrentMarketV2Reserves(state, currentTimestamp)
  );

  const migrateTest = useRootStore((state) => state.migrateBorrowWithoutPermits);

  // start refreshing v3 market at the same time
  usePoolDataV3Subscription();

  // always switch to default v2 in that case for polygon fork
  useEffect(() => {}, []);

  return (
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
          {reserve.variableBorrows}
        </button>
      ))}
      <button onClick={openV3Migration}>Migrate</button>
      <button onClick={migrateTest}>Borrow positions test</button>
    </div>
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
