import { normalizeBN } from '@aave/math-utils';
import { useQuery } from '@tanstack/react-query';
import { Dispatch, useEffect, useMemo } from 'react';
import { isTxErrorType, TxErrorType } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';

import { APP_CODE_PER_SWAP_TYPE } from '../constants/shared.constants';
import { getCowProtocolSellRates } from '../helpers/cow';
import { getParaswapSellRates, getParaswapSlippage } from '../helpers/paraswap';
import { getSwitchProvider } from '../helpers/shared/provider.helpers';
import {
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

const swapTypesThatRequiresInvertedQuote: SwapType[] = [SwapType.DebtSwap];

const getTokenSelectionForQuote = (
  invertedQuoteRoute: boolean,
  provider: SwapProvider,
  state: SwapState
): TokenSelectionParams => {
  const srcTokenObj = invertedQuoteRoute ? state.destinationToken : state.sourceToken;
  const srcToken =
    provider === SwapProvider.PARASWAP ? srcTokenObj.underlyingAddress : srcTokenObj.addressToSwap;
  const destTokenObj = invertedQuoteRoute ? state.sourceToken : state.destinationToken;
  const destToken =
    provider === SwapProvider.PARASWAP
      ? destTokenObj.underlyingAddress
      : destTokenObj.addressToSwap;
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

export const useSwapQuote = ({
  params,
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  const provider = useMemo(
    () =>
      getSwitchProvider({
        chainId: state.chainId,
        assetFrom: state.sourceToken.addressToSwap,
        assetTo: state.destinationToken.addressToSwap,
        swapType: params.swapType,
        shouldUseFlashloan: state.useFlashloan,
      }),
    [
      state.chainId,
      state.sourceToken.addressToSwap,
      state.destinationToken.addressToSwap,
      params.swapType,
      state.useFlashloan,
    ]
  );

  const requiresQuoteInverted = useMemo(
    () =>
      provider === SwapProvider.PARASWAP &&
      swapTypesThatRequiresInvertedQuote.includes(params.swapType) &&
      state.useFlashloan === true,
    [provider, params.swapType, state.useFlashloan]
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

    const nextInputAmount = normalizeBN(quote.srcSpotAmount, quote.srcDecimals).toString();
    const nextOutputAmount = normalizeBN(quote.destSpotAmount, quote.destDecimals).toString();
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

    let slippage, autoSlippage;
    if (state.provider === 'cowprotocol' && quote?.suggestedSlippage !== undefined) {
      slippage = quote.suggestedSlippage.toString();
      autoSlippage = quote.suggestedSlippage.toString();
    } else if (state.provider === 'paraswap') {
      const paraswapSlippage = getParaswapSlippage(
        state.sourceToken.symbol || '',
        state.destinationToken.symbol || ''
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

export const useMultiProviderSwapQuoteQuery = ({
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
    () => getTokenSelectionForQuote(requiresQuoteInverted, provider, state),
    [provider, state.sourceToken, state.destinationToken, state.side, requiresQuoteInverted]
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
            chainId: state.chainId,
            amount,
            srcToken,
            destToken,
            user: state.user,
            srcDecimals,
            destDecimals,
            side,
            options: {
              partner: 'aave-widget', // TODO: Check with paraswap team if we can change it
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
    enabled:
      amount != 'NaN' &&
      amount !== '0' &&
      !state.mainTxState.success &&
      provider !== SwapProvider.NONE &&
      !state.quoteRefreshPaused,
    retry: 0,
    throwOnError: false,
    refetchOnWindowFocus: (query) => (query.state.error ? false : true),
    refetchInterval:
      !state.actionsLoading && !state.quoteRefreshPaused ? QUOTE_REFETCH_INTERVAL : false, // 30 seconds, but pause during action execution or when paused
  });
};
