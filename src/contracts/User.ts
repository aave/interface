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
export type UserConfig = {};

export function userConfigToCell(_config: UserConfig): Cell {
  return beginCell().endCell();
}

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
}
