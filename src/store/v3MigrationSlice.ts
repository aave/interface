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
  selectedMigrationAssets: Record<string, boolean>;
  migrationServiceInstances: Record<string, V3MigrationHelperService>;
  timestamp: number;
  // ACTIONS
  generatePermitPayloadForMigrationAsset: (
    approval: Approval & {
      deadline: string;
    }
  ) => Promise<string>;
  getApprovePermitsForSelectedAssets: () => Approval[];
  toggleMigrationSelectedAsset: (assetName: string) => void;
  getMigratorAddress: () => string;
  getMigrationServiceInstance: () => V3MigrationHelperService;
  migrateWithPermits: (
    signature: SignatureLike[],
    deadline: BigNumberish
  ) => EthereumTransactionTypeExtended[];
  migrateWithoutPermits: () => EthereumTransactionTypeExtended[];
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
    selectedMigrationAssets: {},
    migrationServiceInstances: {},
    timestamp: 0,
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
      set({ timestamp });
      return selectedUserReservesForMigration(get(), timestamp).map(({ reserve }): Approval => {
        return {
          // TODO: should we allow spending of exact ammount of the reserver?
          amount: reserve.totalLiquidity,
          underlyingAsset: reserve.aTokenAddress,
          permitType: 'MIGRATOR',
        };
      });
    },
    migrateWithoutPermits: () => {
      const timestamp = dayjs().unix();
      set({ timestamp });
      const assets: {
        aToken: string;
        deadline: number;
        amount: string;
      }[] = selectedUserReservesForMigration(get(), timestamp).map(({ reserve }) => {
        const deadline = Math.floor(Date.now() / 1000 + 3600);
        return {
          amount: reserve.totalLiquidity,
          aToken: reserve.aTokenAddress,
          // TODO: fow how long to approve?
          deadline,
        };
      });
      const user = get().account;
      console.log(assets, user);
      return get().getMigrationServiceInstance().migrateNoBorrow({ assets, user });
    },
    migrateWithPermits: (signatures: SignatureLike[], deadline: BigNumberish) => {
      const selectedReservers = selectedUserReservesForMigration(get(), get().timestamp);
      const permits = selectedReservers.map(({ reserve }, index) => ({
        aToken: reserve.aTokenAddress,
        value: constants.MaxUint256.toString(),
        deadline,
        signedPermit: signatures[index],
      }));
      // branch out into flashloan or migrate no borrow
      // move that to separate instance and save cache the Migrator instance
      const migratorHelperInstance = get().getMigrationServiceInstance();
      const user = get().account;
      const assets = permits.map((permit) => permit.aToken);
      console.log('migrateNoBorrowWith permits');
      return migratorHelperInstance.migrateNoBorrowWithPermits({
        user,
        assets,
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
      const someAddress = await get().getMigrationServiceInstance().testDeployment();
      console.log(someAddress, 'someAddress');
    },
  };
};
