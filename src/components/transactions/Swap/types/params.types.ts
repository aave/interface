import { InterestRate } from '@aave/contract-helpers';
import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import { SupportedNetworkWithChainId } from '../helpers/shared/misc.helpers';
import { SwapKind, SwapType } from './shared.types';
import { SwappableToken } from './tokens.types';

/**
 * Immutable configuration for a Swap modal/content instance.
 *
 * These params are set by the modal entry and do not change during the user flow.
 * They control visual toggles, default selections and, for protocol flows, carry
 * additional context like reserves. Anything that can be derived or that changes
 * during the session should live in SwapState instead.
 */
export type TokensSwapParams = {
  swapType: SwapType.Swap;
  /** Whether limit orders UI is enabled for this instance. */
  allowLimitOrders: boolean;
  /** Chain where the swap should be performed (affects routing/providers). */
  chainId: number;
  /** Label for the input-token balance row. */
  inputBalanceTitle: string;
  /** Label for the output-token balance row. */
  outputBalanceTitle: string;
  /** Label for the received-amount row on the details block. */
  customReceivedTitle: string;
  /** Allow adding arbitrary token addresses to the token list. */
  allowCustomTokens: boolean;
  /** Show the control to switch input and output assets. */
  showSwitchInputAndOutputAssetsButton: boolean;
  /** Render network selector in the header. */
  showNetworkSelector: boolean;
  /** Render the modal title. */
  showTitle: boolean;
  /** Optional token postfix rendered in the modal title. */
  titleTokenPostfix?: string;
  /** Networks that the modal allows switching to. Used by the selector. */
  supportedNetworks: SupportedNetworkWithChainId[];
  /** Force a specific input token (disables changing it). */
  forcedInputToken?: SwappableToken;
  /** Force a specific output token (disables changing it). */
  forcedOutputToken?: SwappableToken;
  /** Suggested default input token if none is forced. */
  suggestedDefaultInputToken?: SwappableToken;
  /** Suggested default output token if none is forced. */
  suggestedDefaultOutputToken?: SwappableToken;
  /** Whether to show destination balance by default. */
  showOutputBalance: boolean;
  /** Candidate list for source tokens. */
  sourceTokens: SwappableToken[];
  /** Candidate list for destination tokens. */
  destinationTokens: SwappableToken[];
  /** Optional label above the input-amount field. */
  inputInputTitle?: string;
  /** Optional label above the output-amount field. */
  outputInputTitle?: string;

  /** Optional label above the input-amount field for the buy side. Only in Limit Orders mode.*/
  inputInputTitleBuy?: string;
  /** Optional label above the output-amount field for the buy side. Only in Limit Orders mode.*/
  outputInputTitleBuy?: string;
  /** Optional label above the input-amount field for the sell side. Only in Limit Orders mode.*/
  inputInputTitleSell?: string;
  /** Optional label above the output-amount field for the sell side. Only in Limit Orders mode.*/
  outputInputTitleSell?: string;

  /** Callback to invalidate/refresh app-wide state when closing/completing. */
  invalidateAppState: () => void;
  /** Callback to refresh tokens when the chain/network changes. */
  refreshTokens: (chainId: number) => void;
  /** Interest rate mode used by protocol flows (debt/collateral context). */
  interestMode: InterestRate;
  /** Order side selected for the UI; defaults to 'sell'. */
  swapKind: SwapKind;
  /** Label for the tokens from in the result screen. */
  resultScreenTokensFromTitle?: string;
  /** Label for the tokens to in the result screen. */
  resultScreenTokensToTitle?: string;
  /** Label for the title items in the result screen. */
  resultScreenTitleItems?: string;
};

export const isProtocolSwapParams = (params: SwapParams): params is ProtocolSwapParams => {
  return (
    'swapType' in params &&
    params.swapType !== undefined &&
    (params.swapType === SwapType.DebtSwap ||
      params.swapType === SwapType.CollateralSwap ||
      params.swapType === SwapType.RepayWithCollateral ||
      params.swapType === SwapType.WithdrawAndSwap)
  );
};

export const isTokensSwapParams = (params: SwapParams): params is TokensSwapParams => {
  return 'swapType' in params && params.swapType === SwapType.Swap;
};

/**
 * Extension of TokensSwapParams used by protocol-aware flows
 * (CollateralSwap, DebtSwap, RepayWithCollateral, WithdrawAndSwap).
 * Provides the user reserve context for the source and destination assets.
 */
export type ProtocolSwapParams = Omit<TokensSwapParams, 'swapType'> & {
  swapType:
    | SwapType.DebtSwap
    | SwapType.CollateralSwap
    | SwapType.RepayWithCollateral
    | SwapType.WithdrawAndSwap;

  sourceReserve: FormattedUserReserves;
  destinationReserve: FormattedUserReserves;
};

export type SwapParams = TokensSwapParams | ProtocolSwapParams;

export const SwapDefaultParams: SwapParams = {
  swapType: SwapType.Swap,
  swapKind: 'sell',
  allowLimitOrders: true,
  chainId: 1,
  inputBalanceTitle: 'Balance',
  outputBalanceTitle: 'Balance',
  showOutputBalance: false,
  inputInputTitle: undefined,
  outputInputTitle: undefined,
  allowCustomTokens: true,
  showSwitchInputAndOutputAssetsButton: true,
  sourceTokens: [],
  destinationTokens: [],
  customReceivedTitle: 'Received',
  showNetworkSelector: true,
  showTitle: true,
  supportedNetworks: [],

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  invalidateAppState: function () {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refreshTokens: function () {},
  interestMode: InterestRate.Variable,
};
