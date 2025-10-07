import { ChainId } from '@aave/contract-helpers';

import { SwapType } from '../types';

export const ParaswapSupportedNetworks = [
  ChainId.mainnet,
  ChainId.polygon,
  ChainId.avalanche,
  ChainId.sepolia,
  ChainId.base,
  ChainId.arbitrum_one,
  ChainId.optimism,
  ChainId.xdai,
  ChainId.bnb,
  ChainId.sonic,
];

// TODO: Optimize Paraswap Values
export const PARASWAP_GAS_LIMITS: Record<SwapType, number> = {
  [SwapType.Swap]: 1000000,
  [SwapType.CollateralSwap]: 1000000,
  [SwapType.DebtSwap]: 400000,
  [SwapType.RepayWithCollateral]: 700000,
  [SwapType.WithdrawAndSwap]: 1000000,
};
