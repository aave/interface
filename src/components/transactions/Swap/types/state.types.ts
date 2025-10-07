import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';
import { TxStateType } from 'src/hooks/useModal';

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

export type TokensSwapState = {
  swapType: SwapType.Swap;
  // Order
  chainId: number;
  side: SwapKind;
  orderType: OrderType;
  sourceToken: SwappableToken;
  destinationToken: SwappableToken;
  inputAmount: string;
  debouncedInputAmount: string;
  outputAmount: string;
  debouncedOutputAmount: string;
  inputAmountUSD: string;
  outputAmountUSD: string;
  minimumReceived?: string;
  minimumReceivedUSD?: string;
  forcedMaxValue: string;
  isMaxSelected: boolean;

  // TODO: Can we simplify slippage in one?
  slippage: string;
  autoSlippage: string;
  safeSlippage: number;
  expiry: number;

  // Context
  user: string;
  userIsSmartContractWallet: boolean;
  userIsSafeWallet: boolean;
  sourceTokens: SwappableToken[];
  destinationTokens: SwappableToken[];
  error: SwapError | undefined;
  warnings: SwapWarning[];
  actionsBlocked: boolean;

  // Current
  provider: SwapProvider;
  swapRate?: SwapQuoteType;
  ratesLoading: boolean;
  actionsLoading: boolean;
  // Timestamp when the latest quote was received (ms since epoch)
  quoteLastUpdatedAt?: number | null;
  // Quote timer pause bookkeeping
  quoteTimerPausedAt?: number | null;
  quoteTimerPausedAccumMs?: number;
  // Whether automatic quote refresh is paused due to user edits
  quoteRefreshPaused?: boolean;
  isSwapFlowSelected: boolean;
  isLiquidatable: boolean;
  isHFLow: boolean;
  hfAfterSwap: number;
  gasLimit: string;
  useFlashloan: boolean | undefined;
  slippageValidation: ValidationData | undefined;
  showGasStation: boolean;
  mainTxState: TxStateType;

  // Warnings
  showSlippageWarning: boolean;
  showUSDTResetWarning: boolean;
  requiresApprovalReset: boolean;
  isWrongNetwork: boolean;
  showChangeNetworkWarning: boolean;
};

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
  expiry: Math.floor(Date.now() / 1000) + 10 * 60, // 10 minutes
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
  minimumReceived: undefined,
  showSlippageWarning: false,
  showUSDTResetWarning: false,
  showChangeNetworkWarning: false,
  quoteLastUpdatedAt: null,
  quoteTimerPausedAt: null,
  quoteTimerPausedAccumMs: 0,
  quoteRefreshPaused: false,
  slippage: '0.10',
  autoSlippage: '0.10',
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
