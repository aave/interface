import { selectUserNonEmtpySummaryAndIncentive } from './poolSelectors';
import { RootStore } from './root';

export const selectedUserReservesForMigration = (store: RootStore, timestamp: number) => {
  const user = selectUserNonEmtpySummaryAndIncentive(store, timestamp);
  const selectedUserReserves = user.userReservesData.filter(
    (userReserve) => store.selectedMigrationSupplyAssets[userReserve.underlyingAsset]
  );
  return selectedUserReserves;
};

export const selectCurrentMarketV2Reserves = (store: RootStore, timestamp: number) => {
  const currentChainId = store.currentChainId;
  return store.data.get(currentChainId);
};
