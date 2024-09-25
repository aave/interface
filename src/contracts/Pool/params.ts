/* eslint-disable @typescript-eslint/no-explicit-any */
import { Address, beginCell, Cell, Dictionary } from '@ton/core';

import { OPCODE } from './constants';

/* ---------- TYPES ---------- */
export type PoolConfig = {
  admin: Address;
  userCode: Cell;
  bePublickKey: Buffer; //
};

export type ReserveConfig = {
  underlyingAddress: Address;
  poolJWAddress: Address;
  decimals: number;
  LTV: number;
  liquidationThreshold: number;
  isActive: boolean;
  isFrozen: boolean;
  isBorrowingEnabled: boolean;
  stableRateBorrowingEnabled: boolean;
  isPaused: boolean;
  isJetton: boolean;
  reserveFactor: number;
  supplyCap: bigint;
  borrowCap: bigint;
  debtCeiling: bigint;
  content: Cell | any;
};

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
  interestRateMode: number;
  priceData: Dictionary<bigint, Cell>;
};

export type RepayParams = {
  queryId: number;
  poolJWRepay?: Address;
  poolJWCollateral?: Address;
  amount: bigint;
  interestRateMode: number;
  useAToken: boolean;
  isMax: boolean;
  priceData: Dictionary<bigint, Cell>;
};

export type WithdrawParams = {
  queryId: number;
  poolJettonWalletAddress: Address;
  amount: bigint;
  isMaxWithdraw: boolean;
  priceData: Dictionary<bigint, Cell>;
};

export type DepositParams = {
  queryId: number;
  amount: bigint;
};

export type SetUseReserveAsCollateralParams = {
  poolJWAddress: Address;
  useAsCollateral: boolean;
  priceData: Dictionary<bigint, Cell>;
};

export type UpgradeParams = {
  queryId: number;
  code: Cell;
};

/* ---------- Cell Builders ---------- */
export function PoolConfigToCell(config: PoolConfig): Cell {
  const newDict = Dictionary.empty(Dictionary.Keys.BigUint(256), Dictionary.Values.Cell());
  return beginCell()
    .storeAddress(config.admin)
    .storeDict(newDict)
    .storeDict(newDict)
    .storeDict(newDict)
    .storeRef(config.userCode)
    .storeBuffer(config.bePublickKey)
    .endCell();
}

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

export function InitReserveParamsToCell(config: InitReserveParams): Cell {
  const { queryId, poolJWAddress, reserveConfig, rateStrategy } = config;
  const cell = ReserveConfigToCell(reserveConfig);
  return beginCell()
    .storeUint(OPCODE.INIT_RESERVE, 32)
    .storeUint(queryId, 64)
    .storeAddress(poolJWAddress)
    .storeRef(ReserveConfigToCell(reserveConfig))
    .storeRef(RateStrategyToCell(rateStrategy))
    .endCell();
}

export function UpdateConfigParamsToCell(config: UpdateConfigParams): Cell {
  const { queryId, poolJettonWalletAddress, reserveConfig } = config;
  return beginCell()
    .storeUint(OPCODE.UPDATE_CONFIG, 32)
    .storeUint(queryId, 64)
    .storeAddress(poolJettonWalletAddress)
    .storeRef(ReserveConfigToCell(reserveConfig))
    .endCell();
}

export function BorrowParamsToCell(config: BorrowParams): Cell {
  const { queryId, poolJettonWalletAddress, amount, interestRateMode, priceData } = config;
  return beginCell()
    .storeUint(OPCODE.BORROW, 32)
    .storeUint(queryId, 64)
    .storeCoins(amount)
    .storeUint(interestRateMode, 1)
    .storeAddress(poolJettonWalletAddress)
    .storeDict(priceData)
    .endCell();
}

export function RepayParamsToCell(config: RepayParams): Cell {
  const {
    queryId,
    poolJWRepay,
    poolJWCollateral,
    amount,
    interestRateMode,
    useAToken,
    isMax,
    priceData,
  } = config;
  return beginCell()
    .storeUint(OPCODE.REPAY_USE_ATOKEN, 32)
    .storeUint(queryId, 64)
    .storeCoins(amount)
    .storeUint(interestRateMode, 1)
    .storeAddress(poolJWRepay)
    .storeAddress(poolJWCollateral)
    .storeBit(useAToken)
    .storeBit(isMax)
    .storeDict(priceData)
    .endCell();
}

export function WithdrawParamsToCell(config: WithdrawParams): Cell {
  const { queryId, poolJettonWalletAddress, amount, isMaxWithdraw, priceData } = config;
  return beginCell()
    .storeUint(OPCODE.WITHDRAW, 32)
    .storeUint(queryId, 64)
    .storeCoins(amount)
    .storeBit(isMaxWithdraw)
    .storeAddress(poolJettonWalletAddress)
    .storeDict(priceData)
    .endCell();
}

export function DepositParamsToCell(config: DepositParams): Cell {
  return beginCell()
    .storeUint(OPCODE.DEPOSIT, 32)
    .storeUint(config.queryId, 64)
    .storeCoins(config.amount)
    .endCell();
}

export function SetUseReserveAsCollateralParamsToCell(
  config: SetUseReserveAsCollateralParams
): Cell {
  return beginCell()
    .storeUint(OPCODE.SET_USE_RESERVE_AS_COLLATERAL, 32)
    .storeUint(Date.now(), 64)
    .storeAddress(config.poolJWAddress)
    .storeBit(config.useAsCollateral)
    .storeDict(config.priceData)
    .endCell();
}

export function UpgradeParamsToCell(config: UpgradeParams): Cell {
  return beginCell()
    .storeUint(OPCODE.UPGRADE, 32)
    .storeUint(config.queryId, 64)
    .storeRef(config.code)
    .endCell();
}

export function RepayTonParamsToCell(config: RepayParams): Cell {
  const { queryId, amount, interestRateMode, useAToken, isMax, priceData } = config;
  return beginCell()
    .storeUint(OPCODE.REPAY_TON, 32)
    .storeUint(queryId, 64)
    .storeCoins(amount)
    .storeUint(interestRateMode, 1)
    .storeBit(useAToken)
    .storeBit(isMax)
    .storeDict(priceData)
    .endCell();
}
