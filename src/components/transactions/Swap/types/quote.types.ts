import { OrderParameters, QuoteAmountsAndCosts, QuoteAndPost } from '@cowprotocol/cow-sdk';
import { OptimalRate } from '@paraswap/core';
import { TxErrorType } from 'src/ui-config/errorMapping';

import { SwapProvider } from './shared.types';

/**
 * Parameters required to fetch a quote from a provider.
 * The module converts from SwapState into this minimal, provider-agnostic shape.
 */
export type ProviderRatesParams = {
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

  isInputTokenCustom?: boolean;
  isOutputTokenCustom?: boolean;
  appCode: string;

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

  provider: SwapProvider;
};

/** ParaSwap-specific extension of BaseSwitchRates. */
export type ParaswapRatesType = BaseSwitchRates & {
  optimalRateData: OptimalRate;
  provider: SwapProvider.PARASWAP;
  suggestedSlippage?: number;
};

/** CoW Protocol-specific extension of BaseSwitchRates. */
export type CowProtocolRatesType = BaseSwitchRates & {
  provider: SwapProvider.COW_PROTOCOL;

  suggestedSlippage: number;
  amountAndCosts: QuoteAmountsAndCosts;
  srcTokenPriceUsd: number;
  destTokenPriceUsd: number;

  order: OrderParameters;
  quoteId?: number;
  orderBookQuote: QuoteAndPost;
};

export const isParaswapRates = (rates?: SwapQuoteType): rates is ParaswapRatesType => {
  return rates?.provider === SwapProvider.PARASWAP;
};

export const isCowProtocolRates = (rates?: SwapQuoteType): rates is CowProtocolRatesType => {
  return rates?.provider === SwapProvider.COW_PROTOCOL;
};

/** Union of all provider quote types consumed by the UI. */
export type SwapQuoteType = ParaswapRatesType | CowProtocolRatesType;
