import {
  Address,
  beginCell,
  Cell,
  Contract,
  contractAddress,
  ContractProvider,
  Sender,
  SendMode,
} from '@ton/core';

// eslint-disable-next-line @typescript-eslint/ban-types
export type ReserveConfig = {};

export type ReserveData = {
  supplyBalance: bigint;
  borrowBalance: bigint;
  liquidityIndex: bigint;
  borrowIndex: bigint;
  currentLiquidityRate: bigint;
  currentBorrowRate: bigint;
  lastUpdateTimestamp: bigint;
};

export type ReserveConfiguration = {
  isActive: boolean;
  isFrozen: boolean;
  isBorrowingEnabled: boolean;
  LTV: bigint;
  reserveFactor: bigint;
  supplyCap: bigint;
  borrowCap: bigint;
};

export function reserveConfigToCell(_config: ReserveConfig): Cell {
  return beginCell().endCell();
}

export class Reserve implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new Reserve(address);
  }

  static createFromConfig(config: ReserveConfig, code: Cell, workchain = 0) {
    const data = reserveConfigToCell(config);
    const init = { code, data };
    return new Reserve(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async getReserveData(provider: ContractProvider): Promise<ReserveData> {
    const { stack } = await provider.get('get_reserve_data', []);
    console.log('stack', stack);
    return {
      supplyBalance: stack.readBigNumber(),
      borrowBalance: stack.readBigNumber(),
      liquidityIndex: stack.readBigNumber(),
      borrowIndex: stack.readBigNumber(),
      currentLiquidityRate: stack.readBigNumber(),
      currentBorrowRate: stack.readBigNumber(),
      lastUpdateTimestamp: stack.readBigNumber(),
    };
  }

  async getReserveConfiguration(provider: ContractProvider): Promise<ReserveConfiguration> {
    const { stack } = await provider.get('get_reserve_configuration', []);
    return {
      isActive: stack.readBoolean(),
      isFrozen: stack.readBoolean(),
      isBorrowingEnabled: stack.readBoolean(),
      LTV: stack.readBigNumber(),
      reserveFactor: stack.readBigNumber(),
      supplyCap: stack.readBigNumber(),
      borrowCap: stack.readBigNumber(),
    };
  }

  async getPoolAddress(provider: ContractProvider) {
    const { stack } = await provider.get('get_pool_address', []);
    return stack.readAddress();
  }

  async getCurrentBalance(provider: ContractProvider) {
    const { stack } = await provider.get('get_current_balance', []);
    return stack.readBigNumber();
  }

  async getUnderlyingAddress(provider: ContractProvider) {
    const { stack } = await provider.get('get_underlying_address', []);
    return stack.readAddress();
  }
}
