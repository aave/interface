export enum SwapType {
  Swap,
  CollateralSwap,
  DebtSwap,
  RepayWithCollateral,
  WithdrawAndSwap,
}

export enum OrderType {
  MARKET,
  LIMIT,
}

export type SwapKind = 'buy' | 'sell';

export enum SwapProvider {
  COW_PROTOCOL = 'cowprotocol',
  PARASWAP = 'paraswap',
  NONE = 'none',
}

export type SwapStage =
  | 'before_quote'
  | 'after_input_change'
  | 'before_approval'
  | 'before_swap'
  | 'after_swap';

export type SwapError = {
  rawError: Error;
  message: string;
  actionBlocked: boolean;
  stage?: SwapStage;
};

export type SwapWarning = {
  message: string;
};
