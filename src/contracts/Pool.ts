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
} from '@ton/core';

import { Reserve, ReserveData as ReserveState } from './Reserve';

export type PoolConfig = {
  admin: Address;
  reserveCode: Cell;
  userCode: Cell;
};

export function poolConfigToCell(config: PoolConfig): Cell {
  const reserves = Dictionary.empty(Dictionary.Keys.BigUint(32), Dictionary.Values.Address());

  return beginCell()
    .storeUint(0, 32)
    .storeAddress(config.admin)
    .storeRef(config.reserveCode)
    .storeRef(config.userCode)
    .storeDict(reserves)
    .endCell();
}

export type ReserveConfig = {
  LTV: bigint;
  isActive: boolean;
  isFrozen: boolean;
  isBorrowingEnabled: boolean;
  reserveFactor: bigint;
  supplyCap: bigint;
  borrowCap: bigint;
};

export type ReserveData = { underlyingAsset: Address } & ReserveState & ReserveConfig;

export type ReservesData = ReserveData[];

export function reserveConfigToCell(config: ReserveConfig): Cell {
  return beginCell()
    .storeUint(0x36e5ebcb, 32)
    .storeUint(1, 64)
    .storeBit(config.isActive)
    .storeBit(config.isFrozen)
    .storeBit(config.isBorrowingEnabled)
    .storeUint(config.LTV, 32)
    .storeUint(config.reserveFactor, 32)
    .storeCoins(config.supplyCap)
    .storeCoins(config.borrowCap)
    .endCell();
}

export class Pool implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new Pool(address);
  }

  static createFromConfig(config: PoolConfig, code: Cell, workchain = 0) {
    const data = poolConfigToCell(config);
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

  async sendInitReserve(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    amount: bigint,
    underlyingAddress: Address,
    reserveConfig: ReserveConfig
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(0x36e5ebcb, 32)
        .storeUint(0, 64)
        .storeCoins(amount)
        .storeAddress(underlyingAddress)
        .storeRef(reserveConfigToCell(reserveConfig))
        .endCell(),
    });
  }

  async sendMockTransferNotification(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    amount: bigint,
    opts: {
      userAddress: Address;
      underlyingAddress: Address;
      amount: bigint;
    }
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(0x7362d09c, 32) // tranfer_notification
        .storeUint(0, 64)
        .storeAddress(opts.underlyingAddress)
        .storeCoins(amount)
        // forward payload
        .storeRef(
          beginCell()
            .storeUint(0x1530f236, 32)
            .storeUint(0, 64)
            .storeAddress(opts.userAddress)
            .storeCoins(opts.amount)
            .endCell()
        )
        .endCell(),
    });
  }

  async getReserveCount(provider: ContractProvider) {
    const { stack } = await provider.get('get_pool_data', []);
    return stack.readBigNumber();
  }

  async getPoolConfigurator(provider: ContractProvider) {
    const { stack } = await provider.get('get_pool_data', []);
    stack.skip(1);
    return stack.readAddress();
  }

  async getReserveCode(provider: ContractProvider) {
    const { stack } = await provider.get('get_pool_data', []);
    stack.skip(2);
    return stack.readCell();
  }

  async getReservesList(provider: ContractProvider) {
    const { stack } = await provider.get('get_pool_data', []);
    stack.skip(4);

    const reservesList = stack.readCellOpt();
    if (!reservesList) {
      console.log('Empty reserve list');
      return [];
    }

    const dict = Dictionary.loadDirect(
      Dictionary.Keys.BigUint(32),
      Dictionary.Values.Address(),
      reservesList
    );
    const reserves = [];
    for (let i = 0; i < dict.size; i++) {
      const value = dict.get(BigInt(i));
      if (value) {
        reserves.push(value);
      }
    }

    return reserves;
  }

  async getReserveAddress(provider: ContractProvider, underlyingAddress: Address) {
    const { stack } = await provider.get('get_reserve_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(underlyingAddress).endCell(),
      },
    ]);

    return stack.readAddress();
  }

  async getReservesData(provider: ContractProvider): Promise<ReservesData> {
    const reserves = await this.getReservesList(provider);

    const result: ReservesData = [];

    for (const reserve of reserves) {
      const reserveAddress = await this.getReserveAddress(provider, reserve);
      const reserveContract = provider.open(Reserve.createFromAddress(reserveAddress));
      const reserveState = await reserveContract.getReserveData();
      const reserveConfig = await reserveContract.getReserveConfiguration();

      result.push({ underlyingAsset: reserve, ...reserveState, ...reserveConfig });
    }

    return result;
  }
}
