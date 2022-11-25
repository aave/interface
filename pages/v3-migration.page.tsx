import { useEffect } from 'react';
import { StakeModal } from 'src/components/transactions/Stake/StakeModal';
import { StakeCooldownModal } from 'src/components/transactions/StakeCooldown/StakeCooldownModal';
import { StakeRewardClaimModal } from 'src/components/transactions/StakeRewardClaim/StakeRewardClaimModal';
import { UnStakeModal } from 'src/components/transactions/UnStake/UnStakeModal';
import { useUserReserves } from 'src/hooks/useUserReserves';
import { MainLayout } from 'src/layouts/MainLayout';
import { useRootStore } from 'src/store/root';

export default function V3Migration() {
  const { user, borrowPositions } = useUserReserves();
  const toggleSelectedSupplyPosition = useRootStore((state) => state.toggleMigrationSelectedAsset);
  const testMigration = useRootStore((state) => state._testMigration);
  // const migrate = useRootStore((state) => state.migrateSelectedPositions);
  return (
    <div>
      <div onClick={testMigration}>test migration</div>
      <div>supply</div>
      {user.userReservesData.map((reserve) => (
        <div
          key={reserve.underlyingAsset}
          onClick={() => toggleSelectedSupplyPosition(reserve.underlyingAsset)}
        >
          {reserve.underlyingAsset}:<b>{reserve.underlyingBalanceUSD}</b>
        </div>
      ))}
      <div>borrow</div>
      {borrowPositions.map((reserve) => (
        <div key={reserve.underlyingAsset}>{reserve.variableBorrowsUSD}</div>
      ))}
      {/* <button onClick={migrate}>Migrate positions</button> */}
    </div>
  );
}

V3Migration.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      {/** Modals */}
      <StakeModal />
      <StakeCooldownModal />
      <UnStakeModal />
      <StakeRewardClaimModal />
      {/** End of modals */}
    </MainLayout>
  );
};
