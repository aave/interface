import dayjs from 'dayjs';
import { produce } from 'immer';
import { StateCreator } from 'zustand';

import { selectUserNonEmtpySummaryAndIncentive } from './poolSelectors';
import { RootStore } from './root';

export type V3MigrationSlice = {
  //STATE
  selectedMigrationAssets: Record<string, boolean>;
  // ACTIONS
  signPermitForSelectedAssets: () => void;
  toggleMigrationSelectedAsset: (assetName: string) => void;
  migrateSelectedPositions: () => void;
};

export const createV3MigrationSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  V3MigrationSlice
> = (set, get) => {
  return {
    selectedMigrationAssets: {},
    signPermitForSelectedAssets: async () => {
      const timestamp = dayjs().unix();
      const account = get().account;
      const user = selectUserNonEmtpySummaryAndIncentive(get(), timestamp);
      const selectedUserReserves = user.userReservesData.filter(
        (userReserve) => get().selectedMigrationAssets[userReserve.underlyingAsset]
      );
      if (selectedUserReserves.length > 0) {
        const nonces = selectedUserReserves.map((userReserve) => {
          const provider = get().jsonRpcProvider();
          // new ERC20_2612Service(provider).getNonce({
          //   token: userReserve.reserve.aTokenAddress,
          //   owner: account,
          // });
        });
        const noncesValues = await Promise.all(nonces);
      }
    },
    toggleMigrationSelectedAsset: (assetName: string) => {
      set((state) =>
        produce(state, (draft) => {
          if (draft.selectedMigrationAssets[assetName]) {
            delete draft.selectedMigrationAssets[assetName];
          } else {
            draft.selectedMigrationAssets[assetName] = true;
          }
        })
      );
    },
    migrateSelectedPositions: async () => {
      await get().signPermitForSelectedAssets();
    },
  };
};
