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

export type RateStrategyConfig = {
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

export type RateStrategyData = RateStrategyConfig & {
  maxExcessUsageRatio: bigint;
  maxExcessStableToTotalDebtRatio: bigint;
};

export function rateStrategyConfigToCell(config: RateStrategyConfig): Cell {
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

export class RateStrategy implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new RateStrategy(address);
  }

  static createFromConfig(config: RateStrategyConfig, code: Cell, workchain = 0) {
    const data = rateStrategyConfigToCell(config);
    const init = { code, data };
    return new RateStrategy(contractAddress(workchain, init), init);
  }

  async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell().endCell(),
    });
  }

  async getRateStrategyData(provider: ContractProvider): Promise<RateStrategyData> {
    const { stack } = await provider.get('get_rate_strategy_data', []);
    return {
      baseVariableBorrowRate: stack.readBigNumber(),
      optimalUsageRatio: stack.readBigNumber(),
      optimalStableToTotalDebtRatio: stack.readBigNumber(),
      maxExcessUsageRatio: stack.readBigNumber(),
      maxExcessStableToTotalDebtRatio: stack.readBigNumber(),
      variableRateSlope1: stack.readBigNumber(),
      variableRateSlope2: stack.readBigNumber(),
      stableRateSlope1: stack.readBigNumber(),
      stableRateSlope2: stack.readBigNumber(),
      baseStableRateOffset: stack.readBigNumber(),
      stableRateExcessOffset: stack.readBigNumber(),
    };
  }
}
