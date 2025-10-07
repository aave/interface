// import { OrderParameters, QuoteAmountsAndCosts, QuoteAndPost } from '@cowprotocol/cow-sdk';
// import { OptimalRate } from '@paraswap/core';
// import { TxErrorType } from 'src/ui-config/errorMapping';

// export type SwitchProvider = 'cowprotocol' | 'paraswap';

// export type ProviderRatesParams = {
//   amount: string;
//   srcToken: string;
//   srcDecimals: number;

//   destToken: string;
//   destDecimals: number;

//   chainId: number;
//   user: string;
//   options?: Record<string, unknown>;

//   inputSymbol?: string;
//   outputSymbol?: string;

//   isInputTokenCustom?: boolean;
//   isOutputTokenCustom?: boolean;
//   appCode?: string;

//   setError?: (error: TxErrorType) => void;
// };

// export type MultiProviderRatesParams = Omit<ProviderRatesParams, 'srcToken' | 'destToken'> & {
//   srcUnderlyingToken: string;
//   srcAToken?: string;
//   destUnderlyingToken: string;
//   destAToken?: string;
// };

// export type BaseSwitchRates = {
//   // Source token
//   srcToken: string;
//   srcUSD: string;
//   srcAmount: string;
//   srcDecimals: number;

//   // Destination token
//   destToken: string;
//   destUSD: string;
//   destAmount: string;
//   destDecimals: number;

//   provider: SwitchProvider;
// };

// export type ParaswapRatesType = BaseSwitchRates & {
//   optimalRateData: OptimalRate;
//   provider: 'paraswap';
//   suggestedSlippage?: number;
// };

// export type CowProtocolRatesType = BaseSwitchRates & {
//   provider: 'cowprotocol';
//   order: OrderParameters;
//   quoteId?: number;
//   suggestedSlippage: number;
//   amountAndCosts: QuoteAmountsAndCosts;
//   srcTokenPriceUsd: number;
//   destTokenPriceUsd: number;
//   destSpot: string;
//   destSpotInUsd: string;
//   orderBookQuote: QuoteAndPost;
// };

// export const isParaswapRates = (rates?: SwitchRatesType): rates is ParaswapRatesType => {
//   return rates?.provider === 'paraswap';
// };

// export const isCowProtocolRates = (rates?: SwitchRatesType): rates is CowProtocolRatesType => {
//   return rates?.provider === 'cowprotocol';
// };

// export type SwitchRatesType = ParaswapRatesType | CowProtocolRatesType;
