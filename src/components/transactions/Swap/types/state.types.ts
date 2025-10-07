import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';
import { TxStateType } from 'src/hooks/useModal';

import { Expiry } from '../constants/limitOrders.constants';
import { ValidationData } from '../helpers/shared/slippage.helpers';
import { SwapParams } from './params.types';
import { SwapQuoteType } from './quote.types';
import { OrderType, SwapError, SwapKind, SwapType, SwapWarning } from './shared.types';
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
  //   TODO: minimum amount received - to be used in all details components
  debouncedOutputAmount: string;
  inputAmountUSD: string;
  outputAmountUSD: string;
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
  errors: SwapError[];
  warnings: SwapWarning[];
  actionsBlocked: boolean;

  // Current
  swapRate?: SwapQuoteType;
  ratesLoading: boolean;
  actionsLoading: boolean;
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
  showHighPriceImpactWarning: boolean;
  showLowHFWarning: boolean;
  lowHFConfirmed: boolean;
  // TODO: Can we simplify?
  requireConfirmation: boolean;
  requireConfirmationHFlow: boolean;
  highPriceImpactConfirmed: boolean;
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
  expiry: Expiry['One hour'],
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
  inputAmount: '0',
  debouncedInputAmount: '0',
  outputAmount: '0',
  debouncedOutputAmount: '0',
  inputAmountUSD: '0',
  outputAmountUSD: '0',
  forcedMaxValue: '0',
  userIsSmartContractWallet: false,
  userIsSafeWallet: false,
  sourceTokens: [],
  destinationTokens: [],
  isMaxSelected: false,
  errors: [],
  warnings: [],
  actionsBlocked: false,
  ratesLoading: false,
  isSwapFlowSelected: false,
  isLiquidatable: false,
  isHFLow: false,
  hfAfterSwap: 0,
  safeSlippage: 0.005,
  swapRate: undefined,
  showSlippageWarning: false,
  showUSDTResetWarning: false,
  showHighPriceImpactWarning: false,
  showLowHFWarning: false,
  lowHFConfirmed: false,
  requireConfirmation: false,
  requireConfirmationHFlow: false,
  highPriceImpactConfirmed: false,
  showChangeNetworkWarning: false,
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
