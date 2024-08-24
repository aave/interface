import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Dictionary,
  Sender,
  SendMode,
  toNano,
} from '@ton/core';
import _ from 'lodash';

import { readJettonMetadata } from '../helpers/jetton-metadata';
import { User } from './User';

// TODO: Reconstruct the folder structure
const OP = {
  INIT_RESERVE: 0x36e5ebcb,
  UPDATE_CONFIG: 0x36e5edab,
  BORROW: 0xdf316703,
  DEPOSIT: 0x35880552,
};

export type PoolConfig = {
  admin: Address;
  userCode: Cell;
  be_public_key: Buffer;
};

export function PoolConfigToCell(config: PoolConfig): Cell {
  const newDict = Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell());
  return beginCell()
    .storeAddress(config.admin)
    .storeDict(newDict)
    .storeDict(newDict)
    .storeDict(newDict)
    .storeRef(config.userCode)
    .storeBuffer(config.be_public_key)
    .endCell();
}

export type ReserveConfig = {
  underlyingAddress: Address;
  poolJWAddress: Address;
  decimals: number;
  LTV: number;
  liquidationThreshold: number;
  isActive: boolean;
  isFrozen: boolean;
  isBorrowingEnabled: boolean;
  isPaused: boolean;
  isJetton: boolean;
  reserveFactor: number;
  supplyCap: bigint;
  borrowCap: bigint;
  debtCeiling: bigint;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Cell | any;
};

export function ReserveConfigToCell(config: ReserveConfig): Cell {
  return beginCell()
    .storeRef(
      beginCell()
        .storeAddress(config.underlyingAddress)
        .storeAddress(config.poolJWAddress)
        .endCell()
    )
    .storeUint(config.LTV, 16)
    .storeUint(config.liquidationThreshold, 16)
    .storeUint(config.decimals, 8)
    .storeBit(config.isActive)
    .storeBit(config.isFrozen)
    .storeBit(config.isBorrowingEnabled)
    .storeBit(config.isPaused)
    .storeBit(config.isJetton)
    .storeUint(config.reserveFactor, 32)
    .storeCoins(config.supplyCap)
    .storeCoins(config.borrowCap)
    .storeCoins(config.debtCeiling)
    .storeRef(config.content)
    .endCell();
}

/**
 * TODO: Check if the following parameters should be calculated at first:
 * - max_excess_usage_ratio
 * - max_excess_stable_to_total_debt_ratio
 * - base_stable_borrow_rate
 * - max_variable_borrow_rate
 */
export type RateStrategy = {
  baseVariableBorrowRate: bigint;
  optimalUsageRatio: bigint;
  optimalStableToTotalDebtRatio: bigint;
  variableRateSlope1: bigint;
  variableRateSlope2: bigint;
  stableRateSlope1: bigint;
  stableRateSlope2: bigint;
  baseStableRateOffset: bigint;
  stableRateExcessOffset: bigint;
};

export function RateStrategyToCell(config: RateStrategy): Cell {
  return beginCell()
    .storeUint(config.baseVariableBorrowRate, 128)
    .storeRef(
      beginCell()
        .storeUint(config.optimalUsageRatio, 128)
        .storeUint(config.optimalStableToTotalDebtRatio, 128)
        .endCell()
    )
    .storeRef(
      beginCell()
        .storeUint(config.variableRateSlope1, 128)
        .storeUint(config.variableRateSlope2, 128)
        .storeUint(config.stableRateSlope1, 128)
        .storeUint(config.stableRateSlope2, 128)
        .endCell()
    )
    .storeRef(
      beginCell()
        .storeUint(config.baseStableRateOffset, 128)
        .storeUint(config.stableRateExcessOffset, 128)
        .endCell()
    )
    .endCell();
}

export type InitReserveParams = {
  queryId: number;
  poolJWAddress: Address;
  reserveConfig: ReserveConfig;
  rateStrategy: RateStrategy;
};

export type UpdateConfigParams = {
  queryId: bigint;
  poolJettonWalletAddress: Address;
  reserveConfig: ReserveConfig;
};

export type BorrowParams = {
  queryId: number;
  poolJettonWalletAddress: Address;
  amount: bigint;
  price_data: Dictionary<bigint, Cell>;
};

export function InitReserveParamsToCell(config: InitReserveParams): Cell {
  const { queryId, poolJWAddress, reserveConfig, rateStrategy } = config;
  const cell = ReserveConfigToCell(reserveConfig);
  console.log('cell bits:', cell.asSlice().remainingBits);
  return beginCell()
    .storeUint(OP.INIT_RESERVE, 32)
    .storeUint(queryId, 64)
    .storeAddress(poolJWAddress)
    .storeRef(ReserveConfigToCell(reserveConfig))
    .storeRef(RateStrategyToCell(rateStrategy))
    .endCell();
}

export function UpdateConfigParamsToCell(config: UpdateConfigParams): Cell {
  const { queryId, poolJettonWalletAddress, reserveConfig } = config;
  return beginCell()
    .storeUint(OP.UPDATE_CONFIG, 32)
    .storeUint(queryId, 64)
    .storeAddress(poolJettonWalletAddress)
    .storeRef(ReserveConfigToCell(reserveConfig))
    .endCell();
}

export function BorrowParamsToCell(config: BorrowParams): Cell {
  const { queryId, poolJettonWalletAddress, amount, price_data } = config;
  return (
    beginCell()
      .storeUint(OP.BORROW, 32)
      .storeUint(queryId, 64)
      .storeCoins(amount)
      .storeAddress(poolJettonWalletAddress)
      // .storeUint(price, 32)
      .storeDict(price_data)
      .endCell()
  );
}

export type DepositParams = {
  queryId: number;
  amount: bigint;
};

export function DepositParamsToCell(config: DepositParams): Cell {
  return beginCell()
    .storeUint(OP.DEPOSIT, 32)
    .storeUint(config.queryId, 64)
    .storeCoins(config.amount)
    .endCell();
}

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
    console.log('get reserves data');
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

  // async sendBorrow(
  //     provider: ContractProvider,
  //     via: Sender,
  //     value: bigint,
  //     amount: bigint,
  //     poolJettonWalletAddress: Address,
  // ) {
  //     console.log("userWalletAddress - poolJettonWalletAddress",  poolJettonWalletAddress)
  //     await provider.internal(via, {
  //         value,
  //         sendMode: SendMode.PAY_GAS_SEPARATELY,
  //         body: beginCell()
  //             .storeUint(0xdf316703, 32) //0xdf316703 op borrow
  //             .storeUint(Date.now(), 64)
  //             .storeCoins(amount)
  //             // .storeAddress(userWalletAddress)
  //             .storeAddress(poolJettonWalletAddress)
  //             .endCell(),
  //     });
  // }

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
      const borrowings = await userContract.getUserBorrowings();

      const mergedArray = _.values(
        _.merge(_.keyBy(supplies, 'underlyingAddress'), _.keyBy(borrowings, 'underlyingAddress'))
      );

      const updatedData = mergedArray.map((item) => ({
        totalSupply: item.totalSupply || 0,
        variableBorrowBalance: item.variableBorrowBalance || 0,
        liquidityIndex: item.liquidityIndex || 0,
        isCollateral: item.isCollateral || true,
        underlyingAddress: item.underlyingAddress,
        previousIndex: item.previousIndex || 0,
      }));
      return updatedData;
    } catch (err) {
      return [];
    }
  }
}

export function packReserveConfig(config: ReserveConfig): Cell {
  return (
    beginCell()
      .storeRef(
        beginCell()
          .storeAddress(config.underlyingAddress)
          .storeAddress(config.poolJWAddress)
          .endCell()
      )
      // .storeAddress(config.underlyingAddress)
      // .storeAddress(config.poolJWAddress)
      .storeUint(config.LTV, 16)
      .storeUint(config.decimals, 8)
      .storeBit(config.isActive)
      .storeBit(config.isFrozen)
      .storeBit(config.isBorrowingEnabled)
      .storeBit(config.isPaused)
      .storeBit(config.isJetton)
      .storeUint(config.reserveFactor, 32)
      .storeCoins(config.supplyCap)
      .storeCoins(config.borrowCap)
      .storeCoins(config.debtCeiling)
      .storeRef(config.content)
      .endCell()
  );
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
