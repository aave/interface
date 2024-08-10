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

// TODO: Reconstruct the folder structure
const OP = {
  INIT_RESERVE: 0x36e5ebcb,
};

export type MockPoolConfig = {
  admin: Address;
};

export function MockPoolConfigToCell(config: MockPoolConfig): Cell {
  const newDict = Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell());
  return beginCell()
    .storeAddress(config.admin)
    .storeDict(newDict)
    .storeDict(newDict)
    .storeDict(newDict)
    .endCell();
}

export type ReserveConfig = {
  underlyingAddress: Address;
  LTV: number;
  decimals: number;
  isActive: boolean;
  isFrozen: boolean;
  isBorrowingEnabled: boolean;
  isPaused: boolean;
  reserveFactor: number;
  supplyCap: bigint;
  borrowCap: bigint;
  debtCeiling: bigint;
};

export function ReserveConfigToCell(config: ReserveConfig): Cell {
  return beginCell()
    .storeAddress(config.underlyingAddress)
    .storeUint(config.LTV, 16)
    .storeUint(config.decimals, 8)
    .storeBit(config.isActive)
    .storeBit(config.isFrozen)
    .storeBit(config.isBorrowingEnabled)
    .storeBit(config.isPaused)
    .storeUint(config.reserveFactor, 32)
    .storeCoins(config.supplyCap)
    .storeCoins(config.borrowCap)
    .storeCoins(config.debtCeiling)
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
  queryId: bigint;
  underlyingAddress: Address;
  reserveConfig: ReserveConfig;
  rateStrategy: RateStrategy;
};

export function InitReserveParamsToCell(config: InitReserveParams): Cell {
  const { queryId, underlyingAddress, reserveConfig, rateStrategy } = config;
  return beginCell()
    .storeUint(OP.INIT_RESERVE, 32)
    .storeUint(queryId, 64)
    .storeAddress(underlyingAddress)
    .storeRef(ReserveConfigToCell(reserveConfig))
    .storeRef(RateStrategyToCell(rateStrategy))
    .endCell();
}

export class MockPool implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new MockPool(address);
  }

  static createFromConfig(config: MockPoolConfig, code: Cell, workchain = 0) {
    const data = MockPoolConfigToCell(config);
    const init = { code, data };
    return new MockPool(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendInitReserve(provider: ContractProvider, via: Sender, params: InitReserveParams) {
    await provider.internal(via, {
      value: toNano('0.01'),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: InitReserveParamsToCell(params),
    });
  }

  async getReserveConfigs(provider: ContractProvider) {
    const { stack } = await provider.get('get_reserve_configs', []);

    const result = stack.readTuple();

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

    const reserveData = [];
    while (configs.remaining && states.remaining) {
      const cs = configs.readCell();
      const ss = states.readCell();

      const config: ReserveConfig = unpackReserveConfig(cs);
      const state: ReserveState = unpackReserveState(ss);

      reserveData.push({ ...config, ...state });
    }

    return reserveData;
  }
}

export function packReserveConfig(config: ReserveConfig): Cell {
  return beginCell()
    .storeAddress(config.underlyingAddress)
    .storeUint(config.LTV, 16)
    .storeUint(config.decimals, 8)
    .storeBit(config.isActive)
    .storeBit(config.isFrozen)
    .storeBit(config.isBorrowingEnabled)
    .storeBit(config.isPaused)
    .storeUint(config.reserveFactor, 32)
    .storeCoins(config.supplyCap)
    .storeCoins(config.borrowCap)
    .storeCoins(config.debtCeiling)
    .endCell();
}

export function unpackReserveConfig(cell: Cell): ReserveConfig {
  const cs = cell.beginParse();
  return {
    underlyingAddress: cs.loadAddress(),
    LTV: cs.loadUint(16),
    decimals: cs.loadUint(8),
    isActive: cs.loadBoolean(),
    isFrozen: cs.loadBoolean(),
    isBorrowingEnabled: cs.loadBoolean(),
    isPaused: cs.loadBoolean(),
    reserveFactor: cs.loadUint(32),
    supplyCap: cs.loadCoins(),
    borrowCap: cs.loadCoins(),
    debtCeiling: cs.loadCoins(),
  };
}

export type ReserveState = {
  totalSupply: bigint;
  totalStableDebt: bigint;
  totalVariableDebt: bigint;
  liquidityIndex: number;
  stableBorrowIndex: number;
  variableBorrowIndex: number;
  currentLiquidityRate: number;
  currentStableBorrowRate: number;
  currentVariableBorrowRate: number;
  averageStableBorrowRate: number;
  lastUpdateTimestamp: number;
  accruedToTreasury: bigint;
};

export function unpackReserveState(cell: Cell): ReserveState {
  const cs = cell.beginParse();
  const balances = cs.loadRef().beginParse();
  const indexes = cs.loadRef().beginParse();
  const rates = cs.loadRef().beginParse();

  return {
    totalSupply: balances.loadCoins(),
    totalStableDebt: balances.loadCoins(),
    totalVariableDebt: balances.loadCoins(),
    liquidityIndex: indexes.loadUint(128),
    stableBorrowIndex: indexes.loadUint(128),
    variableBorrowIndex: indexes.loadUint(128),
    currentLiquidityRate: rates.loadUint(128),
    currentStableBorrowRate: rates.loadUint(128),
    currentVariableBorrowRate: rates.loadUint(128),
    averageStableBorrowRate: rates.loadUint(128),
    lastUpdateTimestamp: cs.loadUint(128),
    accruedToTreasury: cs.loadCoins(),
  };
}
