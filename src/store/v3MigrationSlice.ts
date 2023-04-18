import {
  ERC20_2612Service,
  ERC20Service,
  EthereumTransactionTypeExtended,
  InterestRate,
  Pool,
  V3MigrationHelperService,
} from '@aave/contract-helpers';
import { MigrationDelegationApproval } from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import { SignatureLike } from '@ethersproject/bytes';
import dayjs from 'dayjs';
import { BigNumberish } from 'ethers';
import { produce } from 'immer';
import { Approval } from 'src/helpers/useTransactionHandler';
import { StateCreator } from 'zustand';

import { selectCurrentChainIdV3MarketData } from './poolSelectors';
import { RootStore } from './root';
import {
  selectMigrationBorrowPermitPayloads,
  selectMigrationRepayAssets,
  selectMigrationSelectedBorrowIndex,
  selectMigrationSelectedSupplyIndex,
  selectMigrationSignedPermits,
  selectUserReservesForMigration,
  selectUserSupplyAssetsForMigrationNoPermit,
  selectUserSupplyIncreasedReservesForMigrationPermits,
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

type MigrationSupplyException = {
  underlyingAsset: string;
  scaledATokenBalance: string;
};

const MIGRATION_ASSETS_EXCEPTIONS: Record<number, string[]> = {
  [1]: ['0xae7ab96520de3a18e5e111b5eaab095312d7fe84'],
};

export type MigrationException = {
  v2UnderlyingAsset: string;
  v3UnderlyingAsset: string;
  amount: string;
};

export type MigrationExceptionsMap = Record<string, MigrationException>;

export type V3MigrationSlice = {
  //STATE
  exceptionsBalancesLoading: boolean;
  selectedMigrationSupplyAssets: MigrationSelectedAsset[];
  selectedMigrationBorrowAssets: MigrationSelectedBorrowAsset[];
  migrationServiceInstances: Record<string, V3MigrationHelperService>;
  migrationExceptions: MigrationExceptionsMap;
  timestamp: number;
  approvalPermitsForMigrationAssets: Array<Approval>;
  // ACTIONS
  generatePermitPayloadForMigrationSupplyAsset: (
    approval: Approval & {
      deadline: string;
    }
  ) => Promise<string>;
  generatePermitPayloadForMigrationBorrowAsset: (
    approval: Approval & {
      deadline: string;
    }
  ) => Promise<string>;
  getApprovePermitsForSelectedAssets: () => Approval[];
  toggleMigrationSelectedSupplyAsset: (assetName: string) => void;
  toggleMigrationSelectedBorrowAsset: (asset: MigrationSelectedBorrowAsset) => void;
  getMigratorAddress: () => string;
  getMigrationServiceInstance: () => V3MigrationHelperService;
  migrateWithPermits: (
    signature: SignatureLike[],
    deadline: BigNumberish
  ) => Promise<EthereumTransactionTypeExtended[]>;
  migrateWithoutPermits: () => Promise<EthereumTransactionTypeExtended[]>;
  resetMigrationSelectedAssets: () => void;
  enforceAsCollateral: (underlyingAsset: string) => void;
  selectAllBorrow: (timestamp: number) => void;
  selectAllSupply: (timestamp: number) => void;
  getMigrationExceptionSupplyBalances: (supplies: MigrationSupplyException[]) => void;
};

export const createV3MigrationSlice: StateCreator<
  RootStore,
  [['zustand/subscribeWithSelector', never], ['zustand/devtools', never]],
  [],
  V3MigrationSlice
> = (set, get) => {
  return {
    exceptionsBalancesLoading: false,
    selectedMigrationSupplyAssets: [],
    selectedMigrationBorrowAssets: [],
    migrationServiceInstances: {},
    migrationExceptions: {},
    timestamp: 0,
    approvalPermitsForMigrationAssets: [],
    generatePermitPayloadForMigrationSupplyAsset: async ({ amount, underlyingAsset, deadline }) => {
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
    generatePermitPayloadForMigrationBorrowAsset: async ({ amount, deadline, underlyingAsset }) => {
      const user = get().account;
      const { getTokenData } = new ERC20Service(get().jsonRpcProvider());

      const { name } = await getTokenData(underlyingAsset);
      const chainId = get().currentChainId;

      const erc20_2612Service = new ERC20_2612Service(get().jsonRpcProvider());

      const nonce = await erc20_2612Service.getNonce({
        token: underlyingAsset,
        owner: user,
      });

      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          DelegationWithSig: [
            { name: 'delegatee', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'DelegationWithSig' as const,
        domain: {
          name,
          version: '1',
          chainId: chainId,
          verifyingContract: underlyingAsset,
        },
        message: {
          delegatee: get().getMigratorAddress(),
          value: amount,
          nonce,
          deadline,
        },
      };

      return JSON.stringify(typedData);
    },
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
          const assetIndex = selectMigrationSelectedSupplyIndex(get(), underlyingAsset);
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
    selectAllSupply: (currentTimestamp: number) => {
      const { supplyReserves } = selectUserReservesForMigration(get(), currentTimestamp);
      if (
        get().selectedMigrationSupplyAssets.length == supplyReserves.length ||
        get().selectedMigrationSupplyAssets.length != 0
      ) {
        set({ selectedMigrationSupplyAssets: [] });
      } else {
        const nonSelectedSupplies = supplyReserves
          .filter((supplyAsset) => supplyAsset.migrationDisabled === undefined)
          .filter(
            ({ underlyingAsset }) => selectMigrationSelectedSupplyIndex(get(), underlyingAsset) < 0
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
    selectAllBorrow: (currentTimestamp: number) => {
      const { borrowReserves } = selectUserReservesForMigration(get(), currentTimestamp);
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
    getApprovePermitsForSelectedAssets: () => {
      const timestamp = dayjs().unix();

      const borrowPermitPayloads = selectMigrationBorrowPermitPayloads(get(), timestamp);

      const supplyPermitPayloads = selectUserSupplyIncreasedReservesForMigrationPermits(
        get(),
        timestamp
      ).map(({ reserve, increasedAmount }): Approval => {
        return {
          amount: increasedAmount,
          underlyingAsset: reserve.aTokenAddress,
          permitType: 'SUPPLY_MIGRATOR_V3',
        };
      });

      const combinedPermitsPayloads = [...supplyPermitPayloads, ...borrowPermitPayloads];
      set({ approvalPermitsForMigrationAssets: combinedPermitsPayloads });
      return combinedPermitsPayloads;
    },
    migrateWithoutPermits: () => {
      const timestamp = dayjs().unix();
      set({ timestamp });
      const supplyAssets = selectUserSupplyAssetsForMigrationNoPermit(get(), timestamp);
      const repayAssets = selectMigrationRepayAssets(get(), timestamp);
      const user = get().account;

      const borrowPermitPayloads = selectMigrationBorrowPermitPayloads(get(), timestamp);
      const creditDelegationApprovals: MigrationDelegationApproval[] = borrowPermitPayloads.map(
        ({ underlyingAsset, amount }) => ({ debtTokenAddress: underlyingAsset, amount })
      );

      return get().getMigrationServiceInstance().migrate({
        repayAssets,
        supplyAssets,
        user,
        creditDelegationApprovals,
        signedCreditDelegationPermits: [],
        signedSupplyPermits: [],
      });
    },
    migrateWithPermits: async (signatures: SignatureLike[], deadline: BigNumberish) => {
      const timestamp = dayjs().unix();
      set({ timestamp });

      const { creditDelegationPermits, supplyPermits } = selectMigrationSignedPermits(
        get(),
        signatures,
        deadline
      );
      const supplyAssets = selectUserSupplyAssetsForMigrationNoPermit(get(), timestamp);
      const repayAssets = selectMigrationRepayAssets(get(), timestamp);
      const user = get().account;

      const borrowPermitPayloads = selectMigrationBorrowPermitPayloads(get(), timestamp);
      const creditDelegationApprovals: MigrationDelegationApproval[] = borrowPermitPayloads.map(
        ({ underlyingAsset, amount }) => ({ debtTokenAddress: underlyingAsset, amount })
      );

      return get().getMigrationServiceInstance().migrate({
        repayAssets,
        supplyAssets,
        user,
        creditDelegationApprovals,
        signedCreditDelegationPermits: creditDelegationPermits,
        signedSupplyPermits: supplyPermits,
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
      const currentMarketV3Data = selectCurrentChainIdV3MarketData(get());
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
    getMigrationExceptionSupplyBalances: async (supplies) => {
      const chainId = get().currentNetworkConfig.underlyingChainId || get().currentChainId;
      const currentChainIdExceptions = MIGRATION_ASSETS_EXCEPTIONS[chainId];
      if (
        currentChainIdExceptions &&
        currentChainIdExceptions.length > 0 &&
        !get().exceptionsBalancesLoading &&
        Object.keys(get().migrationExceptions).length == 0
      ) {
        set({ exceptionsBalancesLoading: true });
        const filteredSuppliesForExceptions = supplies.filter(
          (supply) =>
            currentChainIdExceptions.indexOf(supply.underlyingAsset) >= 0 &&
            supply.scaledATokenBalance !== '0'
        );
        if (filteredSuppliesForExceptions.length > 0) {
          set({ exceptionsBalancesLoading: true });
          const mappedSupplies = filteredSuppliesForExceptions.map(
            ({ scaledATokenBalance, underlyingAsset }) => {
              return get()
                .getMigrationServiceInstance()
                .getMigrationSupply({ amount: scaledATokenBalance, asset: underlyingAsset });
            }
          );
          const supplyBalancesV3 = await Promise.all(mappedSupplies);
          set((state) =>
            produce(state, (draft) => {
              supplyBalancesV3.forEach(([asset, amount], index) => {
                const v2UnderlyingAsset = filteredSuppliesForExceptions[index].underlyingAsset;
                draft.migrationExceptions[v2UnderlyingAsset] = {
                  v2UnderlyingAsset,
                  v3UnderlyingAsset: asset.toLowerCase(),
                  amount: amount.toString(),
                };
              });
              draft.exceptionsBalancesLoading = false;
            })
          );
        }
      }
    },
  };
};
