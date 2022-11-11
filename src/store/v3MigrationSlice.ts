import { ERC20_2612Service, ERC20Service, valueToWei } from '@aave/contract-helpers';
import dayjs from 'dayjs';
import { produce } from 'immer';
import { Approval } from 'src/helpers/useTransactionHandler';
import { StateCreator } from 'zustand';

import { RootStore } from './root';
import { selectedUserReservesForMigration } from './v3MigrationSelectors';

export type V3MigrationSlice = {
  //STATE
  selectedMigrationAssets: Record<string, boolean>;
  // ACTIONS
  generatePermitPayloadForMigrationAsset: (
    approval: Approval & {
      deadline: string;
    }
  ) => Promise<string>;
  getApprovePermitsForSelectedAssets: () => Approval[];
  toggleMigrationSelectedAsset: (assetName: string) => void;
  getMigratorAddress: () => string;
  // migrateSelectedPositions: () => void;
};

export const createV3MigrationSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  V3MigrationSlice
> = (set, get) => {
  return {
    selectedMigrationAssets: {},
    generatePermitPayloadForMigrationAsset: async ({ amount, underlyingAsset, deadline }) => {
      const user = get().account;
      const { getTokenData } = new ERC20Service(get().jsonRpcProvider());
      const { name, decimals } = await getTokenData(underlyingAsset);
      const convertedAmount = valueToWei(amount, decimals);
      const chainId = get().currentChainId;

      const erc20_2612Service = new ERC20_2612Service(get().jsonRpcProvider());

      const nonce = await erc20_2612Service.getNonce({
        token: underlyingAsset,
        owner: user,
      });

      const typeData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'Permit',
        domain: {
          name,
          version: '1',
          chainId,
          verifyingContract: underlyingAsset,
        },
        message: {
          owner: user,
          spender: get().getMigratorAddress(),
          value: convertedAmount,
          nonce,
          deadline,
        },
      };
      return JSON.stringify(typeData);
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
    getApprovePermitsForSelectedAssets: () => {
      const timestamp = dayjs().unix();
      return selectedUserReservesForMigration(get(), timestamp).map(({ reserve }): Approval => {
        reserve.name;
        return {
          amount: reserve.totalLiquidity,
          underlyingAsset: reserve.aTokenAddress,
          permitType: 'MIGRATOR',
        };
      });
    },
    getMigratorAddress: () => {
      // TODO: map migrator addresses for each chain after deployment
      return '0x0000000000';
    },
  };
};
