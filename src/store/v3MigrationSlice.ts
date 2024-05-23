import { InterestRate, V3MigrationHelperService } from '@aave/contract-helpers';
import { produce } from 'immer';
import {
  BorrowMigrationReserve,
  SupplyMigrationReserve,
} from 'src/hooks/migration/useUserMigrationReserves';
import { StateCreator } from 'zustand';

import { RootStore } from './root';
import {
  selectMigrationSelectedBorrowIndex,
  selectMigrationSelectedSupplyIndex,
} from './v3MigrationSelectors';

export type MigrationSelectedAsset = {
  underlyingAsset: string;
  enforced: boolean;
};

export type MigrationSelectedBorrowAsset = {
  debtKey: string;
  underlyingAsset: string;
  interestRate: InterestRate;
};

export type MigrationSupplyException = {
  underlyingAsset: string;
  scaledATokenBalance: string;
};

export const MIGRATION_ASSETS_EXCEPTIONS: Record<number, string[]> = {
  [1]: ['0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
};

export type MigrationException = {
  v2UnderlyingAsset: string;
  v3UnderlyingAsset: string;
  amount: string;
};

export type V3MigrationSlice = {
  //STATE
  selectedMigrationSupplyAssets: MigrationSelectedAsset[];
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[];
  migrationServiceInstances: Record<string, V3MigrationHelperService>;
  timestamp: number;
  // ACTIONS
  toggleMigrationSelectedSupplyAsset: (assetName: string) => void;
  toggleMigrationSelectedBorrowAsset: (asset: MigrationSelectedBorrowAsset) => void;
  resetMigrationSelectedAssets: () => void;
  enforceAsCollateral: (underlyingAsset: string) => void;
  selectAllBorrow: (borrowReserves: BorrowMigrationReserve[]) => void;
  selectAllSupply: (supplyReserves: SupplyMigrationReserve[]) => void;
};

export const createV3MigrationSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  V3MigrationSlice
> = (set, get) => {
  return {
    selectedMigrationSupplyAssets: [],
    selectedMigrationBorrowAssets: [],
    migrationServiceInstances: {},
    timestamp: 0,
    toggleMigrationSelectedSupplyAsset: (underlyingAsset: string) => {
      set((state) =>
        produce(state, (draft) => {
          const activeAssetIndex = draft.selectedMigrationSupplyAssets.findIndex(
            (asset) => asset.underlyingAsset == underlyingAsset
          );

          if (activeAssetIndex >= 0) {
            draft.selectedMigrationSupplyAssets.splice(activeAssetIndex, 1);
          } else {
            draft.selectedMigrationSupplyAssets.push({
              underlyingAsset,
              enforced: false,
            });
          }
        })
      );
    },
    toggleMigrationSelectedBorrowAsset: (asset: MigrationSelectedBorrowAsset) => {
      set((state) =>
        produce(state, (draft) => {
          const activeAssetIndex = draft.selectedMigrationBorrowAssets.findIndex(
            (selectedAsset) => asset.debtKey == selectedAsset.debtKey
          );

          if (activeAssetIndex >= 0) {
            draft.selectedMigrationBorrowAssets.splice(activeAssetIndex, 1);
          } else {
            draft.selectedMigrationBorrowAssets.push(asset);
          }
        })
      );
    },
    enforceAsCollateral: (underlyingAsset: string) => {
      set((state) =>
        produce(state, (draft) => {
          const assetIndex = selectMigrationSelectedSupplyIndex(
            get().selectedMigrationSupplyAssets,
            underlyingAsset
          );
          const assetEnforced = draft.selectedMigrationSupplyAssets[assetIndex]?.enforced;
          if (assetIndex >= 0) {
            draft.selectedMigrationSupplyAssets.forEach((asset) => {
              asset.enforced = false;
            });
            draft.selectedMigrationSupplyAssets[assetIndex].enforced = !assetEnforced;
          }
        })
      );
    },
    resetMigrationSelectedAssets: () => {
      set({
        selectedMigrationBorrowAssets: [],
        selectedMigrationSupplyAssets: [],
      });
    },
    selectAllSupply: (supplyReserves) => {
      if (
        get().selectedMigrationSupplyAssets.length == supplyReserves.length ||
        get().selectedMigrationSupplyAssets.length != 0
      ) {
        set({ selectedMigrationSupplyAssets: [] });
      } else {
        const nonSelectedSupplies = supplyReserves
          .filter((supplyAsset) => supplyAsset.migrationDisabled === undefined)
          .filter(
            ({ underlyingAsset }) =>
              selectMigrationSelectedSupplyIndex(
                get().selectedMigrationSupplyAssets,
                underlyingAsset
              ) < 0
          )
          .map(({ underlyingAsset }) => ({ underlyingAsset, enforced: false }));

        set({
          selectedMigrationSupplyAssets: [
            ...get().selectedMigrationSupplyAssets,
            ...nonSelectedSupplies,
          ],
        });
      }
    },
    selectAllBorrow: (borrowReserves) => {
      if (
        get().selectedMigrationBorrowAssets.length == borrowReserves.length ||
        get().selectedMigrationBorrowAssets.length != 0
      ) {
        set({ selectedMigrationBorrowAssets: [] });
      } else {
        const nonSelectedSupplies = borrowReserves
          .filter((supplyAsset) => supplyAsset.migrationDisabled === undefined)
          .filter(
            (borrowAsset) =>
              selectMigrationSelectedBorrowIndex(get().selectedMigrationBorrowAssets, borrowAsset) <
              0
          );

        set({
          selectedMigrationBorrowAssets: [
            ...get().selectedMigrationBorrowAssets,
            ...nonSelectedSupplies,
          ],
        });
      }
    },
  };
};
