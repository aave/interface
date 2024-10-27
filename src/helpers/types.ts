export type TxState = {
  txError?: string;
  success: boolean;
  gasEstimationError?: string;
};

export type Reward = {
  assets: string[];
  incentiveControllerAddress: string;
  symbol: string;
  balance: string;
  balanceUsd: string;
  rewardTokenAddress: string;
};

export type EmodeCategory = {
  id: number;
  label: string;
  ltv: string;
  liquidationThreshold: string;
  liquidationBonus: string;
  assets: Array<{
    underlyingAsset: string;
    symbol: string;
    iconSymbol: string;
    collateral: boolean;
    borrowable: boolean;
  }>;
};

export enum CollateralType {
  ENABLED,
  ISOLATED_ENABLED,
  DISABLED,
  ISOLATED_DISABLED,
  UNAVAILABLE,
  UNAVAILABLE_DUE_TO_ISOLATION,
}
