import { normalizeBN } from '@aave/math-utils';
import { useQuery } from '@tanstack/react-query';
import { Dispatch, useEffect, useMemo } from 'react';
import { isTxErrorType, TxErrorType } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';

import { TrackAnalyticsHandlers } from '../analytics/useTrackAnalytics';
import { APP_CODE_PER_SWAP_TYPE } from '../constants/shared.constants';
import { hasFlashLoanDisabled } from '../errors/shared/FlashLoanDisabledBlockingGuard';
import { hasInsufficientBalance } from '../errors/shared/InsufficientBalanceGuard';
import { getCowProtocolSellRates } from '../helpers/cow';
import { getParaswapSellRates, getParaswapSlippage } from '../helpers/paraswap';
import { getSwitchProvider } from '../helpers/shared/provider.helpers';
import {
  OrderType,
  SwapParams,
  SwapProvider,
  SwapQuoteType as SwapQuoteType,
  SwapState,
  SwapType,
  TokenType,
} from '../types';

interface TokenSelectionParams {
  srcToken: string;
  destToken: string;
  srcDecimals: number;
  destDecimals: number;
  inputSymbol: string;
  outputSymbol: string;
  isInputTokenCustom: boolean;
  isOutputTokenCustom: boolean;
  side: 'buy' | 'sell';
}

export const swapTypesThatRequiresInvertedQuote: SwapType[] = [
  SwapType.DebtSwap,
  SwapType.RepayWithCollateral,
];

const getTokenSelectionForQuote = (
  invertedQuoteRoute: boolean,
  state: SwapState
): TokenSelectionParams => {
  // Note: Consider the quote an approximation, we prefer underlying address for better support while aTokens value should always match
  const srcTokenObj = invertedQuoteRoute ? state.destinationToken : state.sourceToken;
  const srcToken =
    state.useFlashloan == false &&
    state.provider === SwapProvider.PARASWAP &&
    state.swapType !== SwapType.WithdrawAndSwap
      ? srcTokenObj.addressToSwap
      : srcTokenObj.underlyingAddress;
  const destTokenObj = invertedQuoteRoute ? state.sourceToken : state.destinationToken;
  const destToken =
    state.useFlashloan == false &&
    state.provider === SwapProvider.PARASWAP &&
    state.swapType !== SwapType.WithdrawAndSwap
      ? destTokenObj.addressToSwap
      : destTokenObj.underlyingAddress;

  const srcDecimals = invertedQuoteRoute
    ? state.destinationToken.decimals
    : state.sourceToken.decimals;
  const destDecimals = invertedQuoteRoute
    ? state.sourceToken.decimals
    : state.destinationToken.decimals;
  const inputSymbol = invertedQuoteRoute ? state.destinationToken.symbol : state.sourceToken.symbol;
  const outputSymbol = invertedQuoteRoute
    ? state.sourceToken.symbol
    : state.destinationToken.symbol;
  const isInputTokenCustom = invertedQuoteRoute
    ? state.destinationToken.tokenType === TokenType.USER_CUSTOM
    : state.sourceToken.tokenType === TokenType.USER_CUSTOM;
  const isOutputTokenCustom = invertedQuoteRoute
    ? state.sourceToken.tokenType === TokenType.USER_CUSTOM
    : state.destinationToken.tokenType === TokenType.USER_CUSTOM;
  const side = invertedQuoteRoute ? (state.side === 'buy' ? 'sell' : 'buy') : state.side;

  return {
    srcToken,
    destToken,
    srcDecimals,
    destDecimals,
    inputSymbol,
    outputSymbol,
    isInputTokenCustom,
    isOutputTokenCustom,
    side,
  };
};

export const QUOTE_REFETCH_INTERVAL = 30000; // 30 seconds

/**
 * React hook that orchestrates quoting logic across providers.
 *
 * - Selects provider via getSwitchProvider
 * - Builds provider-agnostic params from SwapState/SwapParams
 * - Periodically refetches quotes and writes normalized values into SwapState
 */
export const useSwapQuote = ({
  params,
  state,
  setState,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers?: TrackAnalyticsHandlers;
}) => {
  // Once transaction succeeds, lock the provider to prevent recalculation
  // (useFlashloan or other dependencies might change after invalidateAppState)
  const provider = useMemo(() => {
    // If transaction already succeeded, use the existing provider from state
    if (state.mainTxState.success && state.provider !== SwapProvider.NONE) {
      return state.provider;
    }
    // Otherwise, calculate provider based on current state
    return getSwitchProvider({
      chainId: state.chainId,
      assetFrom: state.sourceToken.addressToSwap,
      assetTo: state.destinationToken.addressToSwap,
      swapType: params.swapType,
      shouldUseFlashloan: state.useFlashloan,
    });
  }, [
    state.mainTxState.success,
    state.provider,
    state.chainId,
    state.sourceToken.addressToSwap,
    state.destinationToken.addressToSwap,
    params.swapType,
    state.useFlashloan,
  ]);

  const requiresQuoteInverted = useMemo(
    () => swapTypesThatRequiresInvertedQuote.includes(params.swapType),
    [provider, params.swapType]
  );

  const {
    data: swapQuote,
    isLoading: ratesLoading,
    error: ratesError,
  } = useMultiProviderSwapQuoteQuery({
    provider: provider ?? SwapProvider.NONE,
    params,
    state,
    setState,
    requiresQuoteInverted,
  });

  const quoteToState = (quote: SwapQuoteType | null | undefined) => {
    if (!quote) return;

    const nextInputAmount = normalizeBN(quote.srcSpotAmount, quote.srcDecimals).toFixed();
    const nextOutputAmount = normalizeBN(quote.destSpotAmount, quote.destDecimals).toFixed();
    const nextInputAmountUSD = quote.srcSpotUSD;
    const nextOutputAmountUSD = quote.destSpotUSD;

    // Skip update if nothing changed to avoid re-render loops
    if (
      state.provider === quote.provider &&
      state.swapRate?.srcSpotAmount === quote.srcSpotAmount &&
      state.swapRate?.destSpotAmount === quote.destSpotAmount &&
      state.inputAmount === nextInputAmount &&
      state.outputAmount === nextOutputAmount &&
      state.inputAmountUSD === nextInputAmountUSD &&
      state.outputAmountUSD === nextOutputAmountUSD
    ) {
      return;
    }

    let slippage = state.slippage;
    let autoSlippage = state.autoSlippage;
    if (quote.provider === 'cowprotocol' && quote?.suggestedSlippage !== undefined) {
      slippage = quote.suggestedSlippage.toString();
      autoSlippage = quote.suggestedSlippage.toString();
    } else if (quote.provider === 'paraswap') {
      const paraswapSlippage = getParaswapSlippage(
        state.sourceToken.symbol || '',
        state.destinationToken.symbol || '',
        state.swapType
      );
      slippage = paraswapSlippage;
      autoSlippage = paraswapSlippage;
    }

    return {
      swapRate: quote,
      inputAmount: nextInputAmount,
      outputAmount: nextOutputAmount,
      inputAmountUSD: nextInputAmountUSD,
      outputAmountUSD: nextOutputAmountUSD,
      slippage,
      autoSlippage,
    };
  };

  useEffect(() => {
    if (provider) {
      setState({
        provider,
        swapRate: undefined, // Clear the old swap rate to force new quote
        autoSlippage: '', // Clear suggested slippage until a new quote arrives
        quoteRefreshPaused: false, // Ensure quotes can be fetched
      });
    }
  }, [provider]);

  useEffect(() => {
    if (ratesLoading != state.ratesLoading) {
      setState({ ratesLoading: ratesLoading });
    }
  }, [ratesLoading]);

  useEffect(() => {
    if (ratesError) {
      setState({
        error: { rawError: ratesError, message: ratesError.message, actionBlocked: true },
        ratesLoading: false,
        swapRate: undefined,
      });
    }
  }, [ratesError]);

  useEffect(() => {
    if (swapQuote) {
      const isAutoRefreshed = Boolean(state.quoteLastUpdatedAt);
      trackingHandlers?.trackSwapQuote(isAutoRefreshed, swapQuote);

      setState({
        provider: swapQuote.provider,
        ...quoteToState(swapQuote),
        quoteLastUpdatedAt: Date.now(),
        // Reset pause bookkeeping on new quote
        quoteTimerPausedAt: null,
        quoteTimerPausedAccumMs: 0,

        error: undefined,
        actionsBlocked: false,
        warnings: [],
        actionsLoading: false,
      });
    }
  }, [swapQuote]);

  // Pause/resume timer bookkeeping when actions are loading
  useEffect(() => {
    if (state.actionsLoading) {
      if (!state.quoteTimerPausedAt) {
        setState({ quoteTimerPausedAt: Date.now() });
      }
    } else {
      if (state.quoteTimerPausedAt) {
        const pausedDelta = Date.now() - state.quoteTimerPausedAt;
        setState({
          quoteTimerPausedAt: null,
          quoteTimerPausedAccumMs: (state.quoteTimerPausedAccumMs || 0) + pausedDelta,
        });
      }
    }
  }, [state.actionsLoading]);
};

/**
 * Low-level function used by useSwapQuote to query the selected provider.
 * Converts state into provider params and returns a normalized `SwapQuoteType`.
 */
const useMultiProviderSwapQuoteQuery = ({
  params,
  state,
  setState,
  provider,
  requiresQuoteInverted,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  provider: SwapProvider;
  requiresQuoteInverted: boolean;
}) => {
  // Amount to quote depends on side (sell uses input amount, buy uses output amount)
  const amount = useMemo(() => {
    if (state.side === 'sell') {
      return normalizeBN(state.debouncedInputAmount, -1 * state.sourceToken.decimals).toFixed(0);
    } else {
      return normalizeBN(state.debouncedOutputAmount, -1 * state.destinationToken.decimals).toFixed(
        0
      );
    }
  }, [
    state.debouncedInputAmount,
    state.debouncedOutputAmount,
    requiresQuoteInverted,
    state.side,
    state.sourceToken.decimals,
    state.destinationToken.decimals,
  ]);

  const appCode = APP_CODE_PER_SWAP_TYPE[params.swapType];

  const {
    srcToken,
    destToken,
    srcDecimals,
    destDecimals,
    inputSymbol,
    outputSymbol,
    isInputTokenCustom,
    isOutputTokenCustom,
    side,
  } = useMemo(
    () => getTokenSelectionForQuote(requiresQuoteInverted, state),
    [
      state.provider,
      state.sourceToken,
      state.destinationToken,
      state.side,
      requiresQuoteInverted,
      state.useFlashloan,
    ]
  );

  return useQuery<SwapQuoteType | null>({
    queryFn: async () => {
      if (!provider) {
        setState({
          error: {
            rawError: new Error('No swap provider found in the selected chain for this pair'),
            message: 'No swap provider found in the selected chain for this pair',
            actionBlocked: true,
          },
        });
        return null;
      }

      if (state.sourceToken.addressToSwap === state.destinationToken.addressToSwap) {
        setState({
          error: {
            rawError: new Error('Source and destination tokens cannot be the same'),
            message: 'Source and destination tokens cannot be the same',
            actionBlocked: true,
          },
        });
        return null;
      }

      const setError = (error: Error | TxErrorType) => {
        setState({
          error: {
            rawError: isTxErrorType(error) ? error.rawError : error,
            message: isTxErrorType(error) ? 'Error in Swap Quote' : error.message,
            actionBlocked: true,
          },
        });
      };

      switch (provider) {
        case SwapProvider.COW_PROTOCOL:
          return await getCowProtocolSellRates({
            swapType: state.swapType,
            chainId: state.chainId,
            amount,
            srcToken,
            destToken,
            user: state.user,
            srcDecimals,
            destDecimals,
            inputSymbol,
            outputSymbol,
            isInputTokenCustom,
            isOutputTokenCustom,
            appCode,
            setError,
            side,
            invertedQuoteRoute: requiresQuoteInverted,
          });
        case SwapProvider.PARASWAP:
          return await getParaswapSellRates({
            swapType: state.swapType,
            chainId: state.chainId,
            amount,
            srcToken,
            destToken,
            user: state.user,
            srcDecimals,
            destDecimals,
            side,
            appCode,
            options: {
              partner: appCode,
            },
            invertedQuoteRoute: requiresQuoteInverted,
          });
        default:
          // Error
          setError(new Error('No swap provider found in the selected chain for this pair'));
          return null;
      }
    },
    queryKey: queryKeysFactory.swapQuote(
      state.chainId,
      provider,
      amount,
      requiresQuoteInverted,
      srcToken,
      destToken,
      state.user
    ),
    enabled: (() => {
      // Allow fetch when user has entered a positive amount, even if normalization rounded to '0'
      const hasPositiveUserAmount =
        state.side === 'sell'
          ? Number(state.debouncedInputAmount || '0') > 0
          : Number(state.debouncedOutputAmount || '0') > 0;

      // Basic pre-blockers to avoid provider requests
      const isSameTokenPair =
        state.sourceToken.addressToSwap === state.destinationToken.addressToSwap;
      const isFlashloanDisabled = hasFlashLoanDisabled(state);

      return (
        // LIMIT: fetch only once (when no quote yet). MARKET: fetch normally
        ((state.orderType === OrderType.LIMIT && !state.swapRate) ||
          state.orderType === OrderType.MARKET) &&
        hasPositiveUserAmount &&
        !isSameTokenPair &&
        !isFlashloanDisabled &&
        !state.mainTxState.success &&
        !state.mainTxState.txHash && // Don't fetch quotes once transaction is sent
        !state.mainTxState.loading && // Don't fetch quotes while transaction is processing
        provider !== SwapProvider.NONE &&
        !state.quoteRefreshPaused &&
        !state.isWrongNetwork
      );
    })(),
    retry: 0,
    throwOnError: false,
    refetchOnWindowFocus: (query) => (query.state.error ? false : true),
    refetchInterval: (() => {
      // LIMIT: never refetch periodically after we got the first quote
      const isInsufficientBalance = hasInsufficientBalance(state);
      const isFlashloanDisabled = hasFlashLoanDisabled(state);
      return state.orderType !== OrderType.LIMIT &&
        !state.actionsLoading &&
        !state.quoteRefreshPaused &&
        !state.mainTxState.success &&
        !state.mainTxState.txHash &&
        !state.mainTxState.loading &&
        !state.actionsBlocked &&
        !isInsufficientBalance &&
        !isFlashloanDisabled
        ? QUOTE_REFETCH_INTERVAL
        : false;
    })(),
  });
};
