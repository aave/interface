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

// eslint-disable-next-line @typescript-eslint/ban-types
export type UserConfig = {};

export function userConfigToCell(_config: UserConfig): Cell {
  return beginCell().endCell();
}

export type UserData = {
  supplyBalance: bigint;
  stableBorrowBalance: bigint;
  variableBorrowBalance: bigint;
};

export type UserPrincipalData = {
  supplyBalance: bigint;
  stableBorrowBalance: bigint;
  variableBorrowBalance: bigint;
  previousIndex: bigint;
};

export class User implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new User(address);
  }

  static createFromConfig(config: UserConfig, code: Cell, workchain = 0) {
    const data = userConfigToCell(config);
    const init = { code, data };
    return new User(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async sendUpdateColleteral(
    provider: ContractProvider,
    via: Sender,
    value: bigint,
    reserveId: bigint,
    bitMaskValue: bigint
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(0x50168bbe, 32)
        .storeUint(0, 64)
        .storeUint(reserveId, 32)
        .storeUint(bitMaskValue, 1)
        .endCell(),
    });
  }

  async getPoolAddress(provider: ContractProvider) {
    const { stack } = await provider.get('get_pool_address', []);
    return stack.readAddress();
  }

  async getUserAddress(provider: ContractProvider) {
    const { stack } = await provider.get('get_owner_address', []);
    return stack.readAddress();
  }

  async getUserData(provider: ContractProvider): Promise<UserData> {
    const { stack } = await provider.get('get_user_data', []);
    return {
      supplyBalance: stack.readBigNumber(),
      stableBorrowBalance: stack.readBigNumber(),
      variableBorrowBalance: stack.readBigNumber(),
    };
  }

  async getSuppliedCollateralMask(provider: ContractProvider) {
    const { stack } = await provider.get('get_supplied_collateral_mask', []);
    return stack.readBigNumber();
  }

  async getUserPrincipalData(
    provider: ContractProvider,
    reserveId: bigint
  ): Promise<UserPrincipalData> {
    const { stack } = await provider.get('get_user_principal_data', [
      { type: 'int', value: reserveId },
    ]);
    return {
      supplyBalance: stack.readBigNumber(),
      stableBorrowBalance: stack.readBigNumber(),
      variableBorrowBalance: stack.readBigNumber(),
      previousIndex: stack.readBigNumber(),
    };
  }

  async getUserSupplies(provider: ContractProvider) {
    const { stack } = await provider.get('get_user_data', []);

    stack.skip(3);

    const principalList = stack.readCellOpt();
    // console.log('principalList-----', principalList);
    if (!principalList) {
      console.log('Empty principal list');
      return [];
    }

    const dict = Dictionary.loadDirect(
      Dictionary.Keys.BigUint(32),
      Dictionary.Values.Cell(),
      principalList
    );

    const reserves = [];
    let index = 0;
    for (const key of dict.keys()) {
      const value = dict.get(key);
      console.log('🚀 ~ User ~ getUserSupplies ~ value:', value);
      if (value) {
        const cells = Cell.fromBoc(value.toBoc());
        for (const cell of cells) {
          const a = cell.beginParse();
          reserves[index] = {
            reserveID: Number(key.toString()),
            supplyBalance: a.loadCoins(),
            stableBorrowBalance: a.loadCoins(),
            variableBorrowBalance: a.loadCoins(),
          };
          console.log(reserves[index]);
          console.log(`[${key}] - [${value}]`);
          index++;
        }
      }
    }

    return reserves;
  }
}
