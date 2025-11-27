import { SwapType } from '../types';

export const SAFETY_MODULE_TOKENS = [
  'stkgho',
  'stkaave',
  'stkaavewstethbptv2',
  'stkbptv2',
  'stkbpt',
  'stkabpt',
];

export const LIQUIDATION_SAFETY_THRESHOLD = 1.05;
export const LIQUIDATION_DANGER_THRESHOLD = 1.01;
export const SESSION_STORAGE_EXPIRY_MS = 15 * 60 * 1000;

// TODO: Do we want one per swap type to analyze analytics?
export const APP_CODE_PER_SWAP_TYPE: Record<SwapType, string> = {
  [SwapType.Swap]: 'aave-v3-interface-widget',
  [SwapType.CollateralSwap]: 'aave-v3-interface-collateral-swap',
  [SwapType.DebtSwap]: 'aave-v3-interface-debt-swap',
  [SwapType.RepayWithCollateral]: 'aave-v3-interface-repay-with-collateral',
  [SwapType.WithdrawAndSwap]: 'aave-v3-interface-withdraw-and-swap',
};

export const APP_CODE_VALUES = Object.values(APP_CODE_PER_SWAP_TYPE);
