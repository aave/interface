import {
  ERC20_2612Service,
  ERC20Service,
  EthereumTransactionTypeExtended,
  Pool,
  V3MigrationHelperService,
  valueToWei,
} from '@aave/contract-helpers';
import { V3MigrationHelperSignedPermit } from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import { SignatureLike } from '@ethersproject/bytes';
import dayjs from 'dayjs';
import { BigNumberish } from 'ethers';
import { produce } from 'immer';
import { Approval } from 'src/helpers/useTransactionHandler';
import { marketsData } from 'src/utils/marketsAndNetworksConfig';
import { StateCreator } from 'zustand';

import { selectCurrentChainIdV2MarketKey, selectCurrentChainIdV3MarketKey } from './poolSelectors';
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
  setCurrentMarketForMigration: () => void;
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
          async ({ reserve, increasedAmount }): Promise<Approval> => {
            const { getTokenData } = new ERC20Service(get().jsonRpcProvider());
            const { decimals } = await getTokenData(reserve.aTokenAddress);
            const convertedAmount = valueToWei(increasedAmount, decimals);
            return {
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
      return get().currentMarketData.addresses.V3_MIGRATOR || '';
    },
    getMigrationServiceInstance: () => {
      const address = get().getMigratorAddress();
      const migratorInstance = get().migrationServiceInstances[address];
      if (migratorInstance) {
        return migratorInstance;
      }
      const provider = get().jsonRpcProvider();
      const migratorAddress = get().getMigratorAddress();

      // TODO: make it dynamic when network switch will be there
      const v3MarketKey = selectCurrentChainIdV3MarketKey(get());
      const currentMarketV3Data = marketsData[v3MarketKey];
      const pool = new Pool(provider, {
        POOL: currentMarketV3Data.addresses.LENDING_POOL,
        REPAY_WITH_COLLATERAL_ADAPTER: currentMarketV3Data.addresses.REPAY_WITH_COLLATERAL_ADAPTER,
        SWAP_COLLATERAL_ADAPTER: currentMarketV3Data.addresses.SWAP_COLLATERAL_ADAPTER,
        WETH_GATEWAY: currentMarketV3Data.addresses.WETH_GATEWAY,
        L2_ENCODER: currentMarketV3Data.addresses.L2_ENCODER,
      });
      const migrationServiceInstances = get().migrationServiceInstances;
      const newMigratorInstance = new V3MigrationHelperService(provider, migratorAddress, pool);
      set({
        migrationServiceInstances: { ...migrationServiceInstances, [address]: newMigratorInstance },
      });
      return newMigratorInstance;
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
    setCurrentMarketForMigration: () => {
      const newMarketData = selectCurrentChainIdV2MarketKey(get());
      // TOOD: fallback to mainnet if newMarketData do not support v2 and v3
      get().setCurrentMarket(newMarketData);
    },
  };
};
