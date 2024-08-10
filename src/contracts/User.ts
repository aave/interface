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

export type UserConfig = {
  pool: Address;
  owner: Address;
};

export function userConfigToCell(config: UserConfig): Cell {
  const userPrincipals = Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell());
  return (
    beginCell()
      .storeAddress(config.pool)
      .storeAddress(config.owner)
      .storeCoins(0)
      .storeCoins(0)
      .storeCoins(0)
      .storeDict(userPrincipals)
      // .storeUint(0, 256)
      .endCell()
  );
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
  isCollateral: boolean;
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
    poolJWA: Address,
    isCollateral: boolean
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(0x50168bbe, 32)
        .storeUint(0, 64)
        .storeAddress(poolJWA)
        .storeBit(isCollateral)
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
    poolJWA: Address
  ): Promise<UserPrincipalData> {
    const { stack } = await provider.get('get_user_principal_data', [
      {
        type: 'slice',
        cell: beginCell().storeAddress(poolJWA).endCell(),
      },
    ]);
    return {
      supplyBalance: stack.readBigNumber(),
      stableBorrowBalance: stack.readBigNumber(),
      variableBorrowBalance: stack.readBigNumber(),
      previousIndex: stack.readBigNumber(),
      isCollateral: stack.readBoolean(),
    };
  }

  async getUserSupplies(provider: ContractProvider) {
    // const userCollateralMask = (await provider.get('get_supplied_collateral_mask', [])).stack.readNumber();

    const { stack } = await provider.get('get_user_data', []);

    stack.skip(3);

    const principalList = stack.readCellOpt();
    // console.log('principalList-----', principalList);
    if (!principalList) {
      return [];
    }

    const dict = Dictionary.loadDirect(
      Dictionary.Keys.BigUint(256),
      Dictionary.Values.Cell(),
      principalList
    );

    const reserves = [];
    let index = 0;
    for (const key of dict.keys()) {
      const value = dict.get(key);
      if (value) {
        const cells = Cell.fromBoc(value.toBoc());
        for (const cell of cells) {
          const a = cell.beginParse();

          // console.log(Buffer.from(key.toString(16)), 'hex');
          // console.log(key.toString(16));
          reserves[index] = {
            // reserveID: BigInt(key.toString()),
            underlyingAddress: Address.normalize(`0:${key.toString(16)}`),
            supplyBalance: a.loadCoins(),
            stableBorrowBalance: a.loadCoins(),
            variableBorrowBalance: a.loadCoins(),
            previousIndex: a.loadInt(128),
            isCollateral: a.loadBoolean(),
            // isCollateral: (userCollateralMask & Number(key.toString())) > 0,
          };
          // console.log(`[${key}] - [${value}]`);
          index++;
        }
      }
    }

    return reserves;
  }
}
