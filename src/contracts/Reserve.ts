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

export type ReserveData = {
  totalSupply: bigint;
  totalStableBorrow: bigint;
  totalVariableBorrow: bigint;
  liquidityIndex: bigint;
  stableBorrowIndex: bigint;
  variableBorrowIndex: bigint;
  currentLiquidityRate: bigint;
  currentStableBorrowRate: bigint;
  currentVariableBorrowRate: bigint;
  lastUpdateTimestamp: bigint;
  accruedToTreasury: bigint;
};

export type ReserveConfig = {
  rateStrategyAddress: Address;
  decimals: string;
  isActive: boolean;
  isFrozen: boolean;
  isBorrowingEnabled: boolean;
  isPaused: boolean;
  LTV: bigint;
  reserveFactor: bigint;
  supplyCap: bigint;
  borrowCap: bigint;
  debtCeiling: bigint;
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
    return {
      totalSupply: stack.readBigNumber(),
      totalStableBorrow: stack.readBigNumber(),
      totalVariableBorrow: stack.readBigNumber(),
      liquidityIndex: stack.readBigNumber(),
      stableBorrowIndex: stack.readBigNumber(),
      variableBorrowIndex: stack.readBigNumber(),
      currentLiquidityRate: stack.readBigNumber(),
      currentStableBorrowRate: stack.readBigNumber(),
      currentVariableBorrowRate: stack.readBigNumber(),
      lastUpdateTimestamp: stack.readBigNumber(),
      accruedToTreasury: stack.readBigNumber(),
    };
  }

  async getReserveConfiguration(provider: ContractProvider): Promise<ReserveConfig> {
    const { stack } = await provider.get('get_reserve_configuration', []);
    return {
      decimals: stack.readNumber().toString(),
      isActive: stack.readBoolean(),
      isFrozen: stack.readBoolean(),
      isBorrowingEnabled: stack.readBoolean(),
      isPaused: stack.readBoolean(),
      LTV: stack.readBigNumber(),
      reserveFactor: stack.readBigNumber(),
      supplyCap: stack.readBigNumber(),
      borrowCap: stack.readBigNumber(),
      debtCeiling: stack.readBigNumber(),
      rateStrategyAddress: stack.readAddress(),
    };
  }

  async getPoolAddress(provider: ContractProvider) {
    const { stack } = await provider.get('get_pool_address', []);
    return stack.readAddress();
  }

  async getUnderlyingAddress(provider: ContractProvider) {
    const { stack } = await provider.get('get_underlying_address', []);
    return stack.readAddress();
  }

  async getUserAddress(provider: ContractProvider, userAddress: Address) {
    const { stack } = await provider.get('get_user_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(userAddress).endCell(),
      },
    ]);

    return stack.readAddress();
  }

  async getReserveInfo(provider: ContractProvider) {
    const { stack } = await provider.get('get_reserve_info', []);
    return {
      id: stack.readBigNumber(),
    };
  }
}
