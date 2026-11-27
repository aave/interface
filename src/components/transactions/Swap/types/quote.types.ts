import { OrderQuote, SwapQuote } from '@aave/react';
import { OptimalRate } from '@paraswap/core';
import { TxErrorType } from 'src/ui-config/errorMapping';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import { SwapProvider, SwapType } from './shared.types';

/**
 * Parameters required to fetch a quote from a provider.
 * The module converts from SwapState into this minimal, provider-agnostic shape.
 */
export type ProviderRatesParams = {
  swapType: SwapType;
  side?: 'buy' | 'sell';
  invertedQuoteRoute?: boolean;
  amount: string;
  srcToken: string;
  srcDecimals: number;

  destToken: string;
  destDecimals: number;

  chainId: number;
  user: string;
  options?: Record<string, unknown>;

  inputSymbol?: string;
  outputSymbol?: string;

  appCode: string;
  market: CustomMarket;

  setError?: (error: Error | TxErrorType) => void;
};

export type MultiProviderRatesParams = Omit<ProviderRatesParams, 'srcToken' | 'destToken'> & {
  srcUnderlyingToken: string;
  srcAToken?: string;
  destUnderlyingToken: string;
  destAToken?: string;
};

/**
 * Provider-agnostic quote shape used by the UI.
 * All providers must adapt their responses to this before rendering.
 */
export type BaseSwitchRates = {
  // Source token
  srcToken: string;
  srcSpotUSD: string;
  srcSpotAmount: string;
  srcDecimals: number;

  // Destination token
  destToken: string;
  destSpotUSD: string;
  destSpotAmount: string;
  destDecimals: number;

  afterFeesUSD: string;
  afterFeesAmount: string;

  srcTokenPriceUsd: number;
  destTokenPriceUsd: number;

  provider: SwapProvider;
};

/** ParaSwap-specific extension of BaseSwitchRates. */
export type ParaswapRatesType = BaseSwitchRates & {
  optimalRateData: OptimalRate;
  provider: SwapProvider.PARASWAP;
  suggestedSlippage?: number;
};

/** Multiplier range a leverage quote returns, and the multiplier it was priced at. */
export type LeverageQuoteRange = {
  minMultiplier: number;
  maxSafeMultiplier: number;
  // Undefined when the backend picked a safe multiplier itself.
  multiplier?: number;
};

/** Swap quoted by the Aave backend, which places the CoW order. */
export type BackendRatesType = BaseSwitchRates & {
  provider: SwapProvider.COW_PROTOCOL;

  suggestedSlippage: number;
  // Leverage is quoted as an order, every other flow as a swap.
  backendQuote: SwapQuote | OrderQuote;
  // Pool address the quote was made on, needed to execute it.
  market: string;
  leverage?: LeverageQuoteRange;
};

export const isSwapQuote = (quote: SwapQuote | OrderQuote): quote is SwapQuote =>
  quote.__typename === 'SwapQuote';

export const isParaswapRates = (rates?: SwapQuoteType): rates is ParaswapRatesType => {
  return rates?.provider === SwapProvider.PARASWAP;
};

export const isBackendRates = (rates?: SwapQuoteType): rates is BackendRatesType => {
  return rates?.provider === SwapProvider.COW_PROTOCOL && 'backendQuote' in rates;
};

/** Union of all provider quote types consumed by the UI. */
export type SwapQuoteType = ParaswapRatesType | BackendRatesType;
