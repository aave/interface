import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
  toNano,
} from '@ton/core';
import _ from 'lodash';

import { readJettonMetadata } from '../../helpers/jetton-metadata';
import { User } from '../User';
import {
  BorrowParams,
  BorrowParamsToCell,
  DepositParams,
  DepositParamsToCell,
  InitReserveParams,
  InitReserveParamsToCell,
  PoolConfig,
  PoolConfigToCell,
  ReserveConfig,
  SetUseReserveAsCollateralParams,
  SetUseReserveAsCollateralParamsToCell,
  UpdateConfigParams,
  UpdateConfigParamsToCell,
  WithdrawParams,
  WithdrawParamsToCell,
} from './params';

export class Pool implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new Pool(address);
  }

  static createFromConfig(config: PoolConfig, code: Cell, workchain = 0) {
    const data = PoolConfigToCell(config);
    const init = { code, data };
    return new Pool(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendInitReserve(provider: ContractProvider, via: Sender, params: InitReserveParams) {
    const cell = InitReserveParamsToCell(params);
    console.log(cell.asSlice().remainingBits);
    await provider.internal(via, {
      value: toNano('0.01'),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: InitReserveParamsToCell(params),
    });
  }

  async sendUpdateConfig(provider: ContractProvider, via: Sender, params: UpdateConfigParams) {
    await provider.internal(via, {
      value: toNano('0.1'),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: UpdateConfigParamsToCell(params),
    });
  }

  async sendBorrow(provider: ContractProvider, via: Sender, params: BorrowParams) {
    await provider.internal(via, {
      value: toNano('0.2'),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: BorrowParamsToCell(params),
    });
  }

  async sendDeposit(provider: ContractProvider, via: Sender, params: DepositParams) {
    await provider.internal(via, {
      value: params.amount + toNano('0.1'),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: DepositParamsToCell(params),
    });
  }

  async sendWithdraw(provider: ContractProvider, via: Sender, params: WithdrawParams) {
    await provider.internal(via, {
      value: toNano('0.2'),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: WithdrawParamsToCell(params),
    });
  }

  async sendSetUseReserveAsCollateral(
    provider: ContractProvider,
    via: Sender,
    params: SetUseReserveAsCollateralParams
  ) {
    await provider.internal(via, {
      value: toNano('0.1'),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: SetUseReserveAsCollateralParamsToCell(params),
    });
  }

  async getReserveConfigs(provider: ContractProvider) {
    const { stack } = await provider.get('get_reserve_configs', []);

    const result = stack.readTuple();
    console.log('result', result);

    const reserveConfigs: ReserveConfig[] = [];

    while (result.remaining) {
      const config = result.readCell();
      reserveConfigs.push(unpackReserveConfig(config));
    }

    return reserveConfigs;
  }

  async getReservesData(provider: ContractProvider) {
    const { stack } = await provider.get('get_reserves_data', []);

    const configs = stack.readTuple();
    const states = stack.readTuple();

    console.log('configs', configs);
    console.log('states', states);

    const reserveData = [];

    while (configs.remaining && states.remaining) {
      const cs = configs.readCell();
      const ss = states.readCell();

      const config = unpackReserveConfig(cs);
      const content = (await readJettonMetadata(config.content)).metadata;
      const state: Partial<ReserveState> = unpackReserveState(ss);

      delete config.content;

      const assetHash = BigInt('0x' + config.underlyingAddress.hash.toString('hex'));

      reserveData.push({ reserveID: assetHash, ...config, ...state, ...content });
    }
    return reserveData;
  }

  async getUserAddress(provider: ContractProvider, ownerAddress: Address) {
    const { stack } = await provider.get('get_user_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(ownerAddress).endCell(),
      },
    ]);
    return stack.readAddress();
  }

  async getUserData(provider: ContractProvider, ownerAddress: Address) {
    const { stack } = await provider.get('get_user_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(ownerAddress).endCell(),
      },
    ]);

    const userAddress = stack.readAddress();
    const userContract = provider.open(User.createFromAddress(userAddress));

    try {
      const supplies = await userContract.getUserSupplies();
      const variableBorrowings = await userContract.getUserVariableBorrowings();
      const stableBorrowings = await userContract.getUserStableBorrowings();

      const mergedArray = _.values(
        _.merge(
          _.keyBy(supplies, 'underlyingAddress'),
          _.keyBy(variableBorrowings, 'underlyingAddress'),
          _.keyBy(stableBorrowings, 'underlyingAddress')
        )
      );

      const updatedData = mergedArray.map((item) => {
        return {
          underlyingAddress: item.underlyingAddress,
          totalSupply: item.totalSupply || 0,
          liquidityIndex: item.liquidityIndex || BigInt('1000000000000000000000000000'),
          isCollateral: item.isCollateral ?? false,
          variableBorrowBalance: item.variableBorrowBalance || 0,
          variableBorrowIndex: item.variableBorrowIndex || BigInt('1000000000000000000000000000'),
          stableBorrowBalance: item.stableBorrowBalance || 0,
          stableBorrowRate: item.stableBorrowRate || BigInt('0'),
          stableLastUpdateTimestamp: item.stableLastUpdateTimestamp || BigInt('0'),
        };
      });

      return updatedData;
    } catch (err) {
      console.log('Error Log: ', err);
      return [];
    }
  }
}

export function packReserveConfig(config: ReserveConfig): Cell {
  return beginCell()
    .storeRef(
      beginCell()
        .storeAddress(config.underlyingAddress)
        .storeAddress(config.poolJWAddress)
        .endCell()
    )
    .storeUint(config.LTV, 16)
    .storeUint(config.decimals, 8)
    .storeBit(config.isActive)
    .storeBit(config.isFrozen)
    .storeBit(config.isBorrowingEnabled)
    .storeBit(config.stableRateBorrowingEnabled)
    .storeBit(config.isPaused)
    .storeBit(config.isJetton)
    .storeUint(config.reserveFactor, 32)
    .storeCoins(config.supplyCap)
    .storeCoins(config.borrowCap)
    .storeCoins(config.debtCeiling)
    .storeRef(config.content)
    .endCell();
}
export function unpackReserveConfig(cell: Cell): ReserveConfig {
  const cs = cell.beginParse();
  const addresses = cs.loadRef().beginParse();
  return {
    underlyingAddress: addresses.loadAddress(),
    poolJWAddress: addresses.loadAddress(),
    LTV: cs.loadUint(16),
    liquidationThreshold: cs.loadUint(16),
    decimals: cs.loadUint(8),
    isActive: cs.loadBoolean(),
    isFrozen: cs.loadBoolean(),
    isBorrowingEnabled: cs.loadBoolean(),
    stableRateBorrowingEnabled: cs.loadBoolean(),
    isPaused: cs.loadBoolean(),
    isJetton: cs.loadBoolean(),
    reserveFactor: cs.loadUint(32),
    supplyCap: cs.loadCoins(),
    borrowCap: cs.loadCoins(),
    debtCeiling: cs.loadCoins(),
    content: cs.loadRef(),
  };
}

export type ReserveState = {
  totalSupply: bigint;
  liquidity: bigint;
  totalStableDebt: bigint;
  totalVariableDebt: bigint;
  liquidityIndex: bigint;
  stableBorrowIndex: bigint;
  variableBorrowIndex: bigint;
  currentLiquidityRate: bigint;
  currentStableBorrowRate: bigint;
  currentVariableBorrowRate: bigint;
  averageStableBorrowRate: bigint;
  lastUpdateTimestamp: bigint;
  accruedToTreasury: bigint;
};

export function unpackReserveState(cell: Cell): Partial<ReserveState> {
  const cs = cell.beginParse();
  const supplyData = cs.loadRef().beginParse();
  const variableBorrowData = cs.loadRef().beginParse();
  const stableBorrowData = cs.loadRef().beginParse();

  return {
    totalSupply: supplyData.loadCoins(),
    liquidity: supplyData.loadCoins(),
    liquidityIndex: supplyData.loadUintBig(128),
    currentLiquidityRate: supplyData.loadUintBig(128),
    totalVariableDebt: variableBorrowData.loadCoins(),
    variableBorrowIndex: variableBorrowData.loadUintBig(128),
    currentVariableBorrowRate: variableBorrowData.loadUintBig(128),
    totalStableDebt: stableBorrowData.loadCoins(),
    currentStableBorrowRate: stableBorrowData.loadUintBig(128),
    averageStableBorrowRate: stableBorrowData.loadUintBig(128),
    lastUpdateTimestamp: cs.loadUintBig(128),
  };
}

export * from './constants';
export * from './params';
