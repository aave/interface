import { normalizeBN } from '@aave/math-utils';
import { useQuery } from '@tanstack/react-query';
import { Dispatch, useCallback, useEffect, useMemo } from 'react';
import { isTxErrorType, TxErrorType } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';

import { APP_CODE_PER_SWAP_TYPE } from '../constants/shared.constants';
import { getCowProtocolSellRates } from '../helpers/cow';
import { getParaswapSellRates } from '../helpers/paraswap';
import { getSwitchProvider } from '../helpers/shared/switchProvider.helpers';
import { SwapParams, SwapQuoteType as SwapQuoteType, SwapState, TokenType } from '../types';

export const useSwapQuote = ({
  params,
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  const {
    data: swapQuote,
    isLoading: ratesLoading,
    error: ratesError,
  } = useMultiProviderSwapQuoteQuery({
    params,
    state,
    setState,
  });

  // Memoize the setState calls to prevent infinite loops
  const updateRatesError = useCallback((error: Error | null | undefined) => {
    if (error) {
      setState({
        errors: [
          ...(state.errors ?? []),
          { rawError: error, message: error.message, actionBlocked: true },
        ],
      });
    }
  }, []);

  const updateRatesLoading = useCallback((loading: boolean) => {
    setState({ ratesLoading: loading });
  }, []);

  const updateSwapRate = useCallback((quote: SwapQuoteType | null | undefined) => {
    if (quote) {
      const inputAmount = params.invertedQuoteRoute
        ? normalizeBN(quote.destAmount, quote.destDecimals).toString()
        : normalizeBN(quote.srcAmount, quote.srcDecimals).toString();
      const outputAmount = params.invertedQuoteRoute
        ? normalizeBN(quote.srcAmount, quote.srcDecimals).toString()
        : normalizeBN(quote.destAmount, quote.destDecimals).toString();
      const inputAmountUSD = params.invertedQuoteRoute ? quote.destUSD : quote.srcUSD;
      const outputAmountUSD = params.invertedQuoteRoute ? quote.srcUSD : quote.destUSD;

      setState({
        swapRate: quote,
        inputAmount,
        outputAmount,
        inputAmountUSD,
        outputAmountUSD,
      });
    }
  }, []);

  useEffect(() => {
    updateRatesError(ratesError);
  }, [ratesError, updateRatesError]);

  useEffect(() => {
    updateRatesLoading(ratesLoading);
  }, [ratesLoading, updateRatesLoading]);

  useEffect(() => {
    updateSwapRate(swapQuote);
  }, [swapQuote, updateSwapRate]);

  return {
    swapQuote,
    ratesLoading,
    ratesError,
  };
};

export const useMultiProviderSwapQuoteQuery = ({
  params,
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  const amount =
    state.debouncedInputAmount === ''
      ? '0'
      : normalizeBN(state.debouncedInputAmount, -1 * state.sourceToken.decimals).toFixed(0);

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

  // const srcToken = useMemo(() => {
  //   return modalType === ModalType.CollateralSwap
  //     ? shouldUseFlashloan === true || provider === 'paraswap'
  //       ? srcUnderlyingToken
  //       : srcAToken ?? srcUnderlyingToken
  //     : srcUnderlyingToken;
  // }, [srcAToken, srcUnderlyingToken, provider, modalType, shouldUseFlashloan]);

  // const destToken = useMemo(() => {
  //   return modalType === ModalType.CollateralSwap
  //     ? shouldUseFlashloan === true || provider === 'paraswap'
  //       ? destUnderlyingToken
  //       : destAToken ?? destUnderlyingToken
  //     : destUnderlyingToken;
  // }, [destAToken, destUnderlyingToken, provider, modalType, shouldUseFlashloan]);

  const appCode = APP_CODE_PER_SWAP_TYPE[params.swapType];

  return useQuery<SwapQuoteType | null>({
    queryFn: async () => {
      if (!provider) {
        setState({
          errors: [
            {
              rawError: new Error('No swap provider found in the selected chain for this pair'),
              message: 'No swap provider found in the selected chain for this pair',
              actionBlocked: true,
            },
          ],
        });
        return null;
      }

      if (state.sourceToken.addressToSwap === state.destinationToken.addressToSwap) {
        setState({
          errors: [
            {
              rawError: new Error('Source and destination tokens cannot be the same'),
              message: 'Source and destination tokens cannot be the same',
              actionBlocked: true,
            },
          ],
        });
        return null;
      }

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

      const setError = (error: Error | TxErrorType) => {
        setState({
          errors: [
            ...(state.errors ?? []),
            {
              rawError: isTxErrorType(error) ? error.rawError : error,
              message: isTxErrorType(error) ? 'Error in Swap Quote' : error.message,
              actionBlocked: true,
            },
          ],
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
    enabled: amount !== '0' && !state.mainTxState.success,
    retry: 0,
    throwOnError: false,
    refetchOnWindowFocus: (query) => (query.state.error ? false : true),
    refetchInterval: provider === 'cowprotocol' && !state.actionsLoading ? 30000 : false, // 30 seconds, but pause during action execution
  });
};
