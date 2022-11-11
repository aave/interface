import { selectUserNonEmtpySummaryAndIncentive } from './poolSelectors';
import { RootStore } from './root';

export const selectedUserReservesForMigration = (store: RootStore, timestamp: number) => {
  const user = selectUserNonEmtpySummaryAndIncentive(store, timestamp);
  const selectedUserReserves = user.userReservesData.filter(
    (userReserve) => store.selectedMigrationAssets[userReserve.underlyingAsset]
  );
  return selectedUserReserves;
};
