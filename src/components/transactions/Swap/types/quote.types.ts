import { OrderParameters, QuoteAmountsAndCosts, QuoteAndPost } from '@cowprotocol/cow-sdk';
import { OptimalRate } from '@paraswap/core';
import { TxErrorType } from 'src/ui-config/errorMapping';

import { SwapProvider } from './shared.types';

export type ProviderRatesParams = {
  side?: 'buy' | 'sell';
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
  appCode?: string;

  setError?: (error: Error | TxErrorType) => void;
};

export type MultiProviderRatesParams = Omit<ProviderRatesParams, 'srcToken' | 'destToken'> & {
  srcUnderlyingToken: string;
  srcAToken?: string;
  destUnderlyingToken: string;
  destAToken?: string;
};

export type BaseSwitchRates = {
  // Source token
  srcToken: string;
  srcUSD: string;
  srcAmount: string;
  srcDecimals: number;

  // Destination token
  destToken: string;
  destUSD: string;
  destAmount: string;
  destDecimals: number;

  provider: SwapProvider;
};

export type ParaswapRatesType = BaseSwitchRates & {
  optimalRateData: OptimalRate;
  provider: SwapProvider.PARASWAP;
  suggestedSlippage?: number;
};

export type CowProtocolRatesType = BaseSwitchRates & {
  provider: SwapProvider.COW_PROTOCOL;
  order: OrderParameters;
  quoteId?: number;
  suggestedSlippage: number;
  amountAndCosts: QuoteAmountsAndCosts;
  srcTokenPriceUsd: number;
  destTokenPriceUsd: number;
  destSpot: string;
  destSpotInUsd: string;
  orderBookQuote: QuoteAndPost;
};

export const isParaswapRates = (rates?: SwapQuoteType): rates is ParaswapRatesType => {
  return rates?.provider === SwapProvider.PARASWAP;
};

export const isCowProtocolRates = (rates?: SwapQuoteType): rates is CowProtocolRatesType => {
  return rates?.provider === SwapProvider.COW_PROTOCOL;
};

export type SwapQuoteType = ParaswapRatesType | CowProtocolRatesType;
