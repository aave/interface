import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';
import { TxStateType } from 'src/hooks/useModal';

import { Expiry } from '../constants/limitOrders.constants';
import { ValidationData } from '../helpers/shared/slippage.helpers';
import { SwapParams } from './params.types';
import { SwapQuoteType } from './quote.types';
import {
  OrderType,
  SwapError,
  SwapKind,
  SwapProvider,
  SwapType,
  SwapWarning,
} from './shared.types';
import { SwappableToken, TokenType } from './tokens.types';

/**
 * Mutable UI/application state for a token-to-token swap flow.
 *
 * This state is updated as the user interacts (amount edits, token selection),
 * as quotes arrive, and as actions progress. For protocol flows, see
 * ProtocolSwapState which extends this shape with reserve context.
 */
export type TokensSwapState = {
  swapType: SwapType.Swap;
  // Order
  /** EVM chain id where the swap executes. */
  chainId: number;
  /** Selected order side: 'sell' edits input, 'buy' edits output. */
  side: SwapKind;
  /** Market or Limit order type. */
  orderType: OrderType;
  /** Currently selected input token. */
  sourceToken: SwappableToken;
  /** Currently selected output token. */
  destinationToken: SwappableToken;
  /** Raw input amount in human units (string to preserve precision). */
  inputAmount: string;
  /** Debounced input amount used for rate fetching. */
  debouncedInputAmount: string;
  /** Raw output amount in human units (for buy side). */
  outputAmount: string;
  /** Debounced output amount used for rate fetching. */
  debouncedOutputAmount: string;
  /** USD value of input amount at current spot. */
  inputAmountUSD: string;
  /** USD value of output amount at current spot. */
  outputAmountUSD: string;
  /** If set, forces the max value button to use this cap. */
  forcedMaxValue: string;
  /** Whether the user has toggled the Max amount. */
  isMaxSelected: boolean;

  // Processed amounts for the order, based on fees, slippage, inverting requirements, etc.
  /** Sell amount (formatter like '1.234567890') for the swap order request after costs and slippage if applicable, used to build transactions. */
  sellAmountFormatted: string | undefined;
  /** Sell amount (bigint) for the swap order request after costs and slippage if applicable, used to build transactions. */
  sellAmountBigInt: bigint | undefined;
  /** Sell amount (USD value) for the swap order request after costs and slippage if applicable, used to build transactions. */
  sellAmountUSD: string | undefined;
  /** Sell amount (token object) for the swap order request after costs and slippage if applicable, used to build transactions. */
  sellAmountToken: SwappableToken | undefined;
  /** Buy amount (formatter like '1.234567890') for the swap order request after costs and slippage if applicable, used to build transactions. */
  buyAmountFormatted: string | undefined;
  /** Buy amount (bigint) for the swap order request after costs and slippage if applicable, used to build transactions. */
  buyAmountBigInt: bigint | undefined;
  /** Buy amount (USD value) for the swap order request after costs and slippage if applicable, used to build transactions. */
  buyAmountUSD: string | undefined;
  /** Buy amount (token object) for the swap order request after costs and slippage if applicable, used to build transactions. */
  buyAmountToken: SwappableToken | undefined;
  /** Whether the quote route is inverted for this flow (e.g. repay with collateral when we need to swap from Available collateral, second input to Repay, first input). */
  isInvertedSwap: boolean;
  /** Side that was actually quoted after considering inversion (e.g. if the quote route is inverted, the processed side is the opposite of the side). */
  processedSide: SwapKind;

  // Costs (shared across details views)
  /** Network fee expressed in sell currency, normalized to sell token decimals. */
  networkFeeAmountInSellFormatted?: string;
  /** Network fee expressed in buy currency, normalized to buy token decimals. */
  networkFeeAmountInBuyFormatted?: string;
  /** Partner fee amount applied to this order, normalized to the fee token units (depends on side). */
  partnerFeeAmountFormatted?: string;
  /** Partner fee in basis points used to compute partnerFeeAmountFormatted. */
  partnerFeeBps?: number;

  /** User-selected slippage in percentage (e.g. '0.10' -> 0.10%). */
  slippage: string;
  /** Safe default slippage used for warnings and guardrails. */
  safeSlippage: number;
  /** Provider-suggested slippage, used to auto-fill. */
  autoSlippage: string;
  /** Order expiry for limit orders. */
  expiry: Expiry;

  // Context
  /** EOA address performing the swap. */
  user: string;
  /** True if the user is a generic smart contract wallet (SCW). */
  userIsSmartContractWallet: boolean;
  /** True if the user is a Safe wallet. */
  userIsSafeWallet: boolean;
  /** Token list for the source picker. */
  sourceTokens: SwappableToken[];
  /** Token list for the destination picker. */
  destinationTokens: SwappableToken[];
  /** Last surfaced error; when present, usually blocks actions. */
  error: SwapError | undefined;
  /** Non-blocking hints presented to the user. */
  warnings: SwapWarning[];
  /** Computed flag that disables actions until resolved. */
  actionsBlocked: boolean;

  /** Whether the limits order button is blocked. */
  limitsOrderButtonBlocked: boolean;

  // Current
  /** Selected swap provider (cowprotocol, paraswap, none). */
  provider: SwapProvider;
  /** Last received quote/rates for the current provider. */
  swapRate?: SwapQuoteType;
  /** True while querying quotes. */
  ratesLoading: boolean;
  /** True while executing approval/swap actions. */
  actionsLoading: boolean;
  /** Timestamp when the latest quote was received (ms since epoch). */
  quoteLastUpdatedAt?: number | null;
  /** Quote timer pause bookkeeping. */
  quoteTimerPausedAt?: number | null;
  /** Quote timer pause accum ms. */
  quoteTimerPausedAccumMs?: number;
  /** Whether automatic quote refresh is paused due to user edits. */
  quoteRefreshPaused?: boolean;
  /** Set to true once the flow (flashloan vs simple) is determined. */
  isSwapFlowSelected: boolean;
  /** Becomes true if the resulting HF would be below danger threshold. */
  isLiquidatable: boolean;
  /** Becomes true if HF would be low but not liquidatable. */
  isHFLow: boolean;
  /** Predicted health factor after swap, if computable. */
  hfAfterSwap: number;
  /** Gas limit hint computed from estimation or provider. */
  gasLimit: string;
  /** Whether the flow requires using flashloan (protocol flows/HF). */
  useFlashloan: boolean | undefined;
  /** Validation result for slippage input. */
  slippageValidation: ValidationData | undefined;
  /** Whether to show the gas station widget. */
  showGasStation: boolean;
  /** Lifecycle state of the main transaction. */
  mainTxState: TxStateType;

  // Warnings
  /** Show a high-slippage warning. */
  showSlippageWarning: boolean;
  /** Force user to reset approval when switching certain tokens. */
  requiresApprovalReset: boolean;
  /** True if user is connected to the wrong network. */
  isWrongNetwork: boolean;
  showChangeNetworkWarning: boolean;
};

/**
 * State for protocol-aware flows. Includes reserve context for computing
 * HF effects, borrow/collateral semantics, and determining flashloan usage.
 */
export type ProtocolSwapState = Omit<TokensSwapState, 'swapType'> & {
  swapType:
    | SwapType.DebtSwap
    | SwapType.CollateralSwap
    | SwapType.RepayWithCollateral
    | SwapType.WithdrawAndSwap;

  sourceReserve: FormattedUserReserves;
  destinationReserve: FormattedUserReserves;
};

export type SwapState = TokensSwapState | ProtocolSwapState;

export const isProtocolSwapState = (state: SwapState): state is ProtocolSwapState => {
  return (
    ('swapType' in state && state.swapType === SwapType.DebtSwap) ||
    state.swapType === SwapType.CollateralSwap ||
    state.swapType === SwapType.RepayWithCollateral ||
    state.swapType === SwapType.WithdrawAndSwap
  );
};

export const isTokensSwapState = (state: SwapState): state is TokensSwapState => {
  return 'swapType' in state && state.swapType === SwapType.Swap;
};

const defaultToken: SwappableToken = {
  addressToSwap: '',
  addressForUsdPrice: '',
  underlyingAddress: '',
  decimals: 18,
  symbol: '',
  name: '',
  balance: '0',
  chainId: 1,
  logoURI: '',
  tokenType: TokenType.NATIVE,
};

export const swapDefaultState: SwapState = {
  swapType: SwapType.Swap,
  provider: SwapProvider.NONE,
  expiry: Expiry.TEN_MINUTES, // 10 minutes
  user: '',
  actionsLoading: false,
  side: 'sell',
  mainTxState: {
    success: false,
    txHash: undefined,
    loading: false,
  },
  orderType: OrderType.MARKET,
  chainId: 1,
  sourceToken: defaultToken,
  destinationToken: defaultToken,
  inputAmount: '',
  debouncedInputAmount: '',
  outputAmount: '',
  debouncedOutputAmount: '',
  inputAmountUSD: '',
  outputAmountUSD: '',
  forcedMaxValue: '',
  userIsSmartContractWallet: false,
  userIsSafeWallet: false,
  sourceTokens: [],
  destinationTokens: [],
  isMaxSelected: false,
  error: undefined,
  warnings: [],
  actionsBlocked: false,
  ratesLoading: false,
  isSwapFlowSelected: false,
  isLiquidatable: false,
  isHFLow: false,
  hfAfterSwap: 0,
  safeSlippage: 0.005,
  swapRate: undefined,

  sellAmountFormatted: undefined,
  sellAmountBigInt: undefined,
  sellAmountToken: undefined,
  buyAmountFormatted: undefined,
  buyAmountBigInt: undefined,
  buyAmountToken: undefined,
  sellAmountUSD: undefined,
  buyAmountUSD: undefined,
  isInvertedSwap: false,
  processedSide: 'sell',
  networkFeeAmountInSellFormatted: '0',
  networkFeeAmountInBuyFormatted: '0',
  partnerFeeAmountFormatted: '0',
  partnerFeeBps: 0,

  limitsOrderButtonBlocked: false,
  showSlippageWarning: false,
  showChangeNetworkWarning: false,
  quoteLastUpdatedAt: null,
  quoteTimerPausedAt: null,
  quoteTimerPausedAccumMs: 0,
  quoteRefreshPaused: false,
  slippage: '0.10',
  autoSlippage: '',
  gasLimit: '0',
  useFlashloan: undefined,
  slippageValidation: undefined,
  showGasStation: false,
  requiresApprovalReset: false,
  isWrongNetwork: false,
};

export const swapStateFromParamsOrDefault = (
  params: SwapParams,
  defaultState: SwapState
): SwapState => {
  return {
    ...defaultState,
    ...params,

    sourceToken:
      params.forcedInputToken || params.suggestedDefaultInputToken || defaultState.sourceToken,
    destinationToken:
      params.forcedOutputToken ||
      params.suggestedDefaultOutputToken ||
      defaultState.destinationToken,
  };
};
