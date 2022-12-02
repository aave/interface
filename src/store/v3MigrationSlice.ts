import {
  ERC20_2612Service,
  ERC20Service,
  EthereumTransactionTypeExtended,
  V3MigrationHelperService,
  valueToWei,
  Pool,
  InterestRate,
} from '@aave/contract-helpers';
import { V3MigrationHelperSignedPermit } from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import { valueToBigNumber } from '@aave/math-utils';
import { SignatureLike } from '@ethersproject/bytes';
import dayjs from 'dayjs';
import { BigNumber, BigNumberish, constants } from 'ethers';
import { produce } from 'immer';
import { Approval } from 'src/helpers/useTransactionHandler';
import { StateCreator } from 'zustand';

import { RootStore } from './root';
import {
  selectedUserSupplyReservesForMigration,
  selectUserBorrowReservesForMigration,
  selectUserSupplyAssetsForMigrationNoPermit,
  selectUserSupplyAssetsForMigrationWithPermits,
  selectUserSupplyIncreasedReservesForMigrationPermits,
} from './v3MigrationSelectors';

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
  migrateBorrow: (
    signedPermits?: V3MigrationHelperSignedPermit[]
  ) => Promise<EthereumTransactionTypeExtended[]>;
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
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Permit: [
            // { name: 'PERMIT_TYPEHASH', type: 'string' },
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
        selectUserSupplyIncreasedReservesForMigrationPermits(get(), timestamp).map(
          async ({ reserve, increasedAmount, underlyingBalance }): Promise<Approval> => {
            console.log(underlyingBalance, 'underlyingBalance');
            const { getTokenData } = new ERC20Service(get().jsonRpcProvider());
            const { decimals } = await getTokenData(reserve.aTokenAddress);
            const convertedAmount = valueToWei(increasedAmount, decimals);
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
      const borrowedPositions = selectUserBorrowReservesForMigration(get(), timestamp);
      if (borrowedPositions.length > 0) {
        return get().migrateBorrow();
      }
      const assets = selectUserSupplyAssetsForMigrationNoPermit(get(), timestamp);
      const user = get().account;
      return get().getMigrationServiceInstance().migrateNoBorrow({ assets, user });
    },
    migrateWithPermits: async (signatures: SignatureLike[], deadline: BigNumberish) => {
      const signedPermits = selectUserSupplyAssetsForMigrationWithPermits(
        get(),
        signatures,
        deadline
      );
      const borrowedPositions = selectUserBorrowReservesForMigration(get(), get().timestamp);
      if (borrowedPositions.length > 0) {
        return get().migrateBorrow(signedPermits);
      }

      const migratorHelperInstance = get().getMigrationServiceInstance();
      const user = get().account;
      const assets = selectedUserSupplyReservesForMigration(get(), get().timestamp).map(
        (reserve) => reserve.underlyingAsset
      );
      return migratorHelperInstance.migrateNoBorrowWithPermits({
        user,
        assets,
        deadline,
        signedPermits,
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
      const currentMarketData = get().currentMarketData;
      // TODO: make it dynamic when network switch will be there
      const pool = new Pool(provider, {
        POOL: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        REPAY_WITH_COLLATERAL_ADAPTER: currentMarketData.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
        SWAP_COLLATERAL_ADAPTER: currentMarketData.addresses.SWAP_COLLATERAL_ADAPTER,
        WETH_GATEWAY: currentMarketData.addresses.WETH_GATEWAY,
        L2_ENCODER: currentMarketData.addresses.L2_ENCODER,
      });
      const newMigratorInstance = new V3MigrationHelperService(provider, migratorAddress, pool);
      // TODO: don't forget to add maping here
      return newMigratorInstance;
    },
    _testMigration: async () => {
      const currentTimestamp = dayjs().unix();
      const selectedReservers = selectedUserSupplyReservesForMigration(get(), currentTimestamp);
      const mappedAddresses = await Promise.all(
        selectedReservers.map((reserve) =>
          get().getMigrationServiceInstance().testDeployment(reserve.underlyingAsset)
        )
      );
    },
    migrateBorrow: async (signedPermits: V3MigrationHelperSignedPermit[] = []) => {
      const currentTimestamp = dayjs().unix();
      const user = get().account;
      const suppliedPositions = selectUserSupplyAssetsForMigrationNoPermit(get(), currentTimestamp);
      const borrowedPositions = selectUserBorrowReservesForMigration(get(), currentTimestamp);
      const mappedBorrowPositions = borrowedPositions.map(
        ({ increasedAmount, interestRate, underlyingAsset }) => {
          return {
            amount: increasedAmount,
            interestRate,
            address: underlyingAsset,
          };
        }
      );
      return get().getMigrationServiceInstance().migrateWithBorrow({
        user,
        borrowedPositions: mappedBorrowPositions,
        suppliedPositions,
        signedPermits,
      });
    },
  };
};
