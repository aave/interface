import {
  AaveV3Arbitrum,
  AaveV3Avalanche,
  AaveV3Base,
  AaveV3BNB,
  AaveV3Ethereum,
  AaveV3Gnosis,
  AaveV3InkWhitelabel,
  AaveV3Linea,
  AaveV3Plasma,
  AaveV3Polygon,
  AaveV3Sepolia,
} from '@aave-dao/aave-address-book';

import { SwapType } from '../types';

// Chains where swaps hide native <-> wrapped pairs and show wrapped positions with the native symbol.
const WRAPPED_NATIVE_BY_CHAIN: Record<number, string> = {
  [AaveV3Ethereum.CHAIN_ID]: AaveV3Ethereum.ASSETS.WETH.UNDERLYING,
  [AaveV3Gnosis.CHAIN_ID]: AaveV3Gnosis.ASSETS.WXDAI.UNDERLYING,
  [AaveV3Arbitrum.CHAIN_ID]: AaveV3Arbitrum.ASSETS.WETH.UNDERLYING,
  [AaveV3Base.CHAIN_ID]: AaveV3Base.ASSETS.WETH.UNDERLYING,
  [AaveV3Sepolia.CHAIN_ID]: AaveV3Sepolia.ASSETS.WETH.UNDERLYING,
  [AaveV3Polygon.CHAIN_ID]: AaveV3Polygon.ASSETS.WPOL.UNDERLYING,
  [AaveV3Avalanche.CHAIN_ID]: AaveV3Avalanche.ASSETS.WAVAX.UNDERLYING,
  [AaveV3BNB.CHAIN_ID]: AaveV3BNB.ASSETS.WBNB.UNDERLYING,
  [AaveV3Linea.CHAIN_ID]: AaveV3Linea.ASSETS.WETH.UNDERLYING,
  [AaveV3Plasma.CHAIN_ID]: AaveV3Plasma.ASSETS.WXPL.UNDERLYING,
  [AaveV3InkWhitelabel.CHAIN_ID]: AaveV3InkWhitelabel.ASSETS.WETH.UNDERLYING,
};

export const getWrappedNativeAddress = (chainId: number | undefined): string | undefined =>
  chainId === undefined ? undefined : WRAPPED_NATIVE_BY_CHAIN[chainId]?.toLowerCase();

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
  [SwapType.Leverage]: 'aave-v3-interface-leverage',
};

export const APP_CODE_VALUES = Object.values(APP_CODE_PER_SWAP_TYPE);
