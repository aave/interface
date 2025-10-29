/** All supported swap flows. */
export enum SwapType {
  Swap,
  CollateralSwap,
  DebtSwap,
  RepayWithCollateral,
  WithdrawAndSwap,
}

/** Order flavor shown in the UI. */
export enum OrderType {
  MARKET,
  LIMIT,
}

/**
 * Side of the order:
 * - 'sell' = user edits input amount; output is quoted
 * - 'buy' = user edits output amount; input is quoted
 */
export type SwapKind = 'buy' | 'sell';

/** Current execution/quote provider. */
export enum SwapProvider {
  COW_PROTOCOL = 'cowprotocol',
  PARASWAP = 'paraswap',
  NONE = 'none',
}

/** Coarse-grained UI stages used by warnings/errors tracking. */
export type SwapStage =
  | 'before_quote'
  | 'after_input_change'
  | 'before_approval'
  | 'before_swap'
  | 'after_swap';

/** Normalized error surfaced to the UI. */
export type SwapError = {
  rawError: Error;
  message: string;
  actionBlocked: boolean;
  stage?: SwapStage;
};

/** Non-blocking information surfaced to the user. */
export type SwapWarning = {
  message: string;
};
