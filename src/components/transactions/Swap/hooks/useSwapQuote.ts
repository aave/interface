import { normalizeBN } from '@aave/math-utils';
import { useQuery } from '@tanstack/react-query';
import { Dispatch, useEffect, useMemo } from 'react';
import { isTxErrorType, TxErrorType } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';

import { APP_CODE_PER_SWAP_TYPE } from '../constants/shared.constants';
import { getCowProtocolSellRates } from '../helpers/cow';
import { getParaswapSellRates, getParaswapSlippage } from '../helpers/paraswap';
import { getSwitchProvider } from '../helpers/shared/switchProvider.helpers';
import {
  SwapParams,
  SwapProvider,
  SwapQuoteType as SwapQuoteType,
  SwapState,
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

const getTokenSelection = (params: SwapParams, state: SwapState): TokenSelectionParams => {
  const srcToken = params.invertedQuoteRoute
    ? state.destinationToken.addressToSwap
    : state.sourceToken.addressToSwap;
  const destToken = params.invertedQuoteRoute
    ? state.sourceToken.addressToSwap
    : state.destinationToken.addressToSwap;
  const srcDecimals = params.invertedQuoteRoute
    ? state.destinationToken.decimals
    : state.sourceToken.decimals;
  const destDecimals = params.invertedQuoteRoute
    ? state.sourceToken.decimals
    : state.destinationToken.decimals;
  const inputSymbol = params.invertedQuoteRoute
    ? state.destinationToken.symbol
    : state.sourceToken.symbol;
  const outputSymbol = params.invertedQuoteRoute
    ? state.sourceToken.symbol
    : state.destinationToken.symbol;
  const isInputTokenCustom = params.invertedQuoteRoute
    ? state.destinationToken.tokenType === TokenType.USER_CUSTOM
    : state.sourceToken.tokenType === TokenType.USER_CUSTOM;
  const isOutputTokenCustom = params.invertedQuoteRoute
    ? state.sourceToken.tokenType === TokenType.USER_CUSTOM
    : state.destinationToken.tokenType === TokenType.USER_CUSTOM;
  const side = params.invertedQuoteRoute ? (state.side === 'buy' ? 'sell' : 'buy') : state.side;

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

  const {
    data: swapQuote,
    isLoading: ratesLoading,
    error: ratesError,
  } = useMultiProviderSwapQuoteQuery({
    provider: provider ?? SwapProvider.NONE,
    params,
    state,
    setState,
  });

  const quoteToState = (quote: SwapQuoteType | null | undefined) => {
    if (!quote) return;

    const nextInputAmount = params.invertedQuoteRoute
      ? normalizeBN(quote.destSpotAmount, quote.destDecimals).toString()
      : normalizeBN(quote.srcSpotAmount, quote.srcDecimals).toString();
    const nextOutputAmount = params.invertedQuoteRoute
      ? normalizeBN(quote.srcSpotAmount, quote.srcDecimals).toString()
      : normalizeBN(quote.destSpotAmount, quote.destDecimals).toString();
    const nextInputAmountUSD = params.invertedQuoteRoute ? quote.destSpotUSD : quote.srcSpotUSD;
    const nextOutputAmountUSD = params.invertedQuoteRoute ? quote.srcSpotUSD : quote.destSpotUSD;

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
      setState({ provider });
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
        ...quoteToState(swapQuote),
        quoteLastUpdatedAt: Date.now(),
        // Reset pause bookkeeping on new quote
        quoteTimerPausedAt: null,
        quoteTimerPausedAccumMs: 0,
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
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  provider: SwapProvider;
}) => {
  // Amount to quote depends on side (sell uses input amount, buy uses output amount)
  const amount = (() => {
    const isBuy = params.invertedQuoteRoute
      ? state.side === 'sell' // inverted route flips semantics
      : state.side === 'buy';
    if (isBuy) {
      const raw = state.debouncedOutputAmount === '' ? '0' : state.debouncedOutputAmount;
      return normalizeBN(raw, -1 * state.destinationToken.decimals).toFixed(0);
    } else {
      const raw = state.debouncedInputAmount === '' ? '0' : state.debouncedInputAmount;
      return normalizeBN(raw, -1 * state.sourceToken.decimals).toFixed(0);
    }
  })();

  const appCode = APP_CODE_PER_SWAP_TYPE[params.swapType];

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
      } = getTokenSelection(params, state);

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
        case 'cowprotocol':
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
          });
        case 'paraswap':
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
              partner: appCode,
            },
          });
        default:
          return null;
      }
    },
    queryKey: queryKeysFactory.swapQuote(
      state.chainId,
      amount,
      state.sourceToken.addressToSwap,
      state.destinationToken.addressToSwap,
      state.user
    ),
    enabled:
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
