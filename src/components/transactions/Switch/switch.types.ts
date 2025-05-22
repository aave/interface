import { OrderParameters, QuoteAmountsAndCosts } from '@cowprotocol/cow-sdk';
import { OptimalRate } from '@paraswap/core';
import { TxErrorType } from 'src/ui-config/errorMapping';

export type SwitchProvider = 'cowprotocol' | 'paraswap';

export type SwitchParams = {
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

  setError?: (error: TxErrorType) => void;
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

  provider: SwitchProvider;
};

export type ParaswapRatesType = BaseSwitchRates & {
  optimalRateData: OptimalRate;
  provider: 'paraswap';
};

export type CowProtocolRatesType = BaseSwitchRates & {
  provider: 'cowprotocol';
  order: OrderParameters;
  quoteId?: number;
  suggestedSlippage: number;
  amountAndCosts: QuoteAmountsAndCosts;
  srcTokenPriceUsd: number;
  destTokenPriceUsd: number;
};

export const isParaswapRates = (rates?: SwitchRatesType): rates is ParaswapRatesType => {
  return rates?.provider === 'paraswap';
};

export const isCowProtocolRates = (rates?: SwitchRatesType): rates is CowProtocolRatesType => {
  return rates?.provider === 'cowprotocol';
};

export type SwitchRatesType = ParaswapRatesType | CowProtocolRatesType;
