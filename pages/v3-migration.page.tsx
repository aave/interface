import { MigrateV3Modal } from 'src/components/transactions/MigrateV3/MigrateV3Modal';
import { StakeModal } from 'src/components/transactions/Stake/StakeModal';
import { StakeCooldownModal } from 'src/components/transactions/StakeCooldown/StakeCooldownModal';
import { StakeRewardClaimModal } from 'src/components/transactions/StakeRewardClaim/StakeRewardClaimModal';
import { UnStakeModal } from 'src/components/transactions/UnStake/UnStakeModal';
import { useModalContext } from 'src/hooks/useModal';
import { useUserReserves } from 'src/hooks/useUserReserves';
import { MainLayout } from 'src/layouts/MainLayout';
import { useRootStore } from 'src/store/root';

export default function V3Migration() {
  const { user, borrowPositions } = useUserReserves();
  const { openV3Migration } = useModalContext();

  const toggleSelectedSupplyPosition = useRootStore((state) => state.toggleMigrationSelectedAsset);
  const testMigration = useRootStore((state) => state._testMigration);
  const selectedAssets = useRootStore((state) => state.selectedMigrationAssets);

  return (
    <div>
      <button onClick={() => testMigration()}>test migration</button>
      <div>supply</div>
      {user.userReservesData.map((reserve) => (
        <div
          key={reserve.underlyingAsset}
          onClick={() => toggleSelectedSupplyPosition(reserve.underlyingAsset)}
          style={{ color: selectedAssets[reserve.underlyingAsset] ? 'red' : 'black' }}
        >
          {reserve.underlyingAsset}:<b>{reserve.underlyingBalanceUSD}</b>
        </div>
      ))}
      <div>borrow</div>
      {borrowPositions.map((reserve) => (
        <div key={reserve.underlyingAsset}>{reserve.variableBorrowsUSD}</div>
      ))}
      <button onClick={openV3Migration}>Migrate</button>
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
