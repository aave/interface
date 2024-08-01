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

import { JettonMinter } from './JettonMinter';
import { Reserve, ReserveConfig, ReserveData as ReserveState } from './Reserve';
import { User } from './User';

export type PoolConfig = {
  admin: Address;
  reserveCode: Cell;
  userCode: Cell;
};

export function poolConfigToCell(config: PoolConfig): Cell {
  const reserves = Dictionary.empty(Dictionary.Keys.BigUint(32), Dictionary.Values.Address());

  return beginCell()
    .storeUint(0, 32)
    .storeUint(0, 32)
    .storeAddress(config.admin)
    .storeCoins(0)
    .storeCoins(0)
    .storeCoins(0)
    .storeRef(config.reserveCode)
    .storeRef(config.userCode)
    .storeDict(reserves)
    .endCell();
}

export type ReserveMetadata = {
  underlyingAsset: Address;
  name: string;
  symbol: string;
  decimals: string;
  image: string;
  description: string;
};

export type ReserveData = ReserveMetadata & ReserveState & ReserveConfig;

export type ReservesData = ReserveData[];

export function reserveConfigToCell(config: ReserveConfig): Cell {
  const reserveConfigCell = beginCell()
    .storeAddress(config.rateStrategyAddress)
    .storeUint(config.LTV, 16)
    .storeInt(BigInt(config.decimals), 8)
    .storeBit(config.isActive)
    .storeBit(config.isFrozen)
    .storeBit(config.isBorrowingEnabled)
    .storeBit(config.isPaused)
    .storeUint(config.reserveFactor, 32)
    .storeCoins(config.supplyCap)
    .storeCoins(config.borrowCap)
    .storeCoins(config.debtCeiling)
    .endCell();

  return beginCell().storeUint(0x36e5ebcb, 32).storeRef(reserveConfigCell).endCell();
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
    stack.skip(5);
    // console.log(stack);

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

  async getCurrentReserveId(provider: ContractProvider) {
    const { stack } = await provider.get('get_pool_data', []);
    return stack.readBigNumber();
  }

  async getReservesData(provider: ContractProvider): Promise<ReservesData> {
    const reserves = await this.getReservesList(provider);

    const result: ReservesData = [];

    for (const reserve of reserves) {
      const jettonMinter = provider.open(JettonMinter.createFromAddress(reserve));
      const metadata = (await jettonMinter.getContent()).metadata;
      const reserveMetadata: ReserveMetadata = {
        name: metadata.name ?? '',
        symbol: metadata.symbol ?? '',
        decimals: metadata.decimals ?? '',
        image: metadata.image ?? '',
        description: metadata.description ?? '',
        underlyingAsset: reserve,
      };

      const reserveAddress = await this.getReserveAddress(provider, reserve);
      const reserveContract = provider.open(Reserve.createFromAddress(reserveAddress));
      const reserveState = await reserveContract.getReserveData();
      const reserveConfig = await reserveContract.getReserveConfiguration();

      result.push({ ...reserveMetadata, ...reserveState, ...reserveConfig });
    }

    return result;
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

  async getUserSupplies(provider: ContractProvider, ownerAddress: Address) {
    const { stack } = await provider.get('get_user_address', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(ownerAddress).endCell(),
      },
    ]);

    const userAddress = stack.readAddress();
    const userContract = provider.open(User.createFromAddress(userAddress));

    const userSupplies = await userContract.getUserSupplies();
    const reserveList = await this.getReservesList(provider);
    console.log('reserveList', reserveList);
    const results = userSupplies.map((s) => ({
      ...s,
      underlyingAddress: reserveList[s.reserveID],
    }));

    return results;
  }
}
