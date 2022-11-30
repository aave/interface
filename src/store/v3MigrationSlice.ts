import {
  ERC20_2612Service,
  ERC20Service,
  EthereumTransactionTypeExtended,
  V3MigrationHelperService,
  valueToWei,
} from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import dayjs from 'dayjs';
import { BigNumberish, constants } from 'ethers';
import { produce } from 'immer';
import { Approval } from 'src/helpers/useTransactionHandler';
import { StateCreator } from 'zustand';

import { RootStore } from './root';
import { selectedUserReservesForMigration } from './v3MigrationSelectors';

export type V3MigrationSlice = {
  //STATE
  selectedMigrationSupplyAssets: Record<string, boolean>;
  selectedMigrationBorrowAssets: Record<string, boolean>;
  migrationServiceInstances: Record<string, V3MigrationHelperService>;
  timestamp: number;
  approvalPermitsForMigrationAssets: Array<Approval>;
  // ACTIONS
  generatePermitPayloadForMigrationAsset: (
    approval: Approval & {
      deadline: string;
    }
  ) => Promise<string>;
  getApprovePermitsForSelectedAssets: () => Promise<Approval[]>;
  toggleMigrationSelectedSupplyAsset: (assetName: string) => void;
  toggleMigrationSelectedBorrowAsset: (assetName: string) => void;
  getMigratorAddress: () => string;
  getMigrationServiceInstance: () => V3MigrationHelperService;
  migrateWithPermits: (
    signature: SignatureLike[],
    deadline: BigNumberish
  ) => Promise<EthereumTransactionTypeExtended[]>;
  migrateWithoutPermits: () => Promise<EthereumTransactionTypeExtended[]>;
  _testMigration: () => void;
  // migrateSelectedPositions: () => void;
};

export const createV3MigrationSlice: StateCreator<
  RootStore,
  [['zustand/devtools', never]],
  [],
  V3MigrationSlice
> = (set, get) => {
  return {
    selectedMigrationSupplyAssets: {},
    selectedMigrationBorrowAssets: {},
    migrationServiceInstances: {},
    timestamp: 0,
    approvalPermitsForMigrationAssets: [],
    generatePermitPayloadForMigrationAsset: async ({ amount, underlyingAsset, deadline }) => {
      const user = get().account;
      const { getTokenData } = new ERC20Service(get().jsonRpcProvider());

      const { name } = await getTokenData(underlyingAsset);
      const chainId = get().currentChainId;
      console.log(name, 'name');

      const erc20_2612Service = new ERC20_2612Service(get().jsonRpcProvider());

      const nonce = await erc20_2612Service.getNonce({
        token: underlyingAsset,
        owner: user,
      });

      const typeData = {
        types: {
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
          value: amount,
          nonce,
          deadline,
        },
      };
      return JSON.stringify(typeData);
    },
    toggleMigrationSelectedSupplyAsset: (assetName: string) => {
      set((state) =>
        produce(state, (draft) => {
          if (draft.selectedMigrationSupplyAssets[assetName]) {
            delete draft.selectedMigrationSupplyAssets[assetName];
          } else {
            draft.selectedMigrationSupplyAssets[assetName] = true;
          }
        })
      );
    },
    toggleMigrationSelectedBorrowAsset: (assetName: string) => {
      set((state) =>
        produce(state, (draft) => {
          if (draft.selectedMigrationBorrowAssets[assetName]) {
            delete draft.selectedMigrationBorrowAssets[assetName];
          } else {
            draft.selectedMigrationBorrowAssets[assetName] = true;
          }
        })
      );
    },
    getApprovePermitsForSelectedAssets: async () => {
      const timestamp = dayjs().unix();
      const approvalPermitsForMigrationAssets = await Promise.all(
        selectedUserReservesForMigration(get(), timestamp).map(
          async ({ reserve, underlyingBalance }): Promise<Approval> => {
            const { getTokenData } = new ERC20Service(get().jsonRpcProvider());
            const { name, decimals } = await getTokenData(reserve.aTokenAddress);
            const amount = (Number(underlyingBalance) + 100).toString();
            const convertedAmount = valueToWei(amount, decimals);
            return {
              // TODO: should we allow spending of exact ammount of the reserver?
              amount: convertedAmount,
              underlyingAsset: reserve.aTokenAddress,
              permitType: 'MIGRATOR',
            };
          }
        )
      );
      set({ approvalPermitsForMigrationAssets });
      return approvalPermitsForMigrationAssets;
    },
    migrateWithoutPermits: () => {
      const timestamp = dayjs().unix();
      set({ timestamp });
      const assets: {
        aToken: string;
        deadline: number;
        amount: string;
        underlyingAsset: string;
      }[] = selectedUserReservesForMigration(get(), timestamp).map(
        ({ underlyingAsset, underlyingBalance, reserve }) => {
          const deadline = Math.floor(Date.now() / 1000 + 3600);
          return {
            amount: constants.MaxUint256.toString(),
            aToken: reserve.aTokenAddress,
            underlyingAsset: underlyingAsset,
            // TODO: fow how long to approve?
            deadline,
          };
        }
      );
      const user = get().account;
      return get().getMigrationServiceInstance().migrateNoBorrow({ assets, user });
    },
    migrateWithPermits: async (signatures: SignatureLike[], deadline: BigNumberish) => {
      const permits = await Promise.all(
        get().approvalPermitsForMigrationAssets.map(async ({ amount, underlyingAsset }, index) => {
          return {
            signedPermit: signatures[index],
            deadline,
            aToken: underlyingAsset,
            value: amount,
          };
        })
      );
      // branch out into flashloan or migrate no borrow
      // move that to separate instance and save cache the Migrator instance
      const migratorHelperInstance = get().getMigrationServiceInstance();
      const user = get().account;
      const assets = selectedUserReservesForMigration(get(), get().timestamp).map(
        (reserve) => reserve.underlyingAsset
      );
      await get()._testMigration();
      console.log(assets);
      return migratorHelperInstance.migrateNoBorrowWithPermits({
        user,
        assets,
        deadline,
        signedPermits: permits,
      });
    },
    getMigratorAddress: () => {
      // TODO: map migrator addresses for each chain after deployment
      return '0x01ce9bbcc0418614a8bba983fe79cf77211996f2';
    },
    getMigrationServiceInstance: () => {
      const address = get().getMigratorAddress();
      const migratorInstance = get().migrationServiceInstances[address];
      if (migratorInstance) {
        return migratorInstance;
      }
      const provider = get().jsonRpcProvider();
      const migratorAddress = get().getMigratorAddress();
      const newMigratorInstance = new V3MigrationHelperService(provider, migratorAddress);
      // TODO: don't forget to add maping here
      return newMigratorInstance;
    },
    _testMigration: async () => {
      const currentTimestamp = dayjs().unix();
      const selectedReservers = selectedUserReservesForMigration(get(), currentTimestamp);
      const mappedAddresses = await Promise.all(
        selectedReservers.map((reserve) =>
          get().getMigrationServiceInstance().testDeployment(reserve.underlyingAsset)
        )
      );

      console.log(mappedAddresses);
    },
  };
};
