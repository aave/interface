import { supplySwapQuote, tokenSwapQuote, withdrawSwapQuote } from '@aave/client/actions';
import { normalize, normalizeBN } from '@aave/math-utils';
import {
  AaveClient,
  bigDecimal,
  chainId as sdkChainId,
  evmAddress,
  reserveId,
  TokenSwapKind,
  useAaveClient,
  userBorrowItemId,
  userSupplyItemId,
} from '@aave/react';
import { useQuery } from '@tanstack/react-query';
import { BigNumber } from 'bignumber.js';
import { Dispatch, useEffect, useMemo } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { CoWProtocolPricesService } from 'src/services/CoWProtocolPricesService';
import { useRootStore } from 'src/store/root';
import { isTxErrorType, TxErrorType } from 'src/ui-config/errorMapping';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { marketsData } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../analytics/useTrackAnalytics';
import { APP_CODE_PER_SWAP_TYPE, getWrappedNativeAddress } from '../constants/shared.constants';
import { hasFlashLoanDisabled } from '../errors/shared/FlashLoanDisabledBlockingGuard';
import { hasInsufficientBalance } from '../errors/shared/InsufficientBalanceGuard';
import { getCowProtocolSellRates, isNativeToken } from '../helpers/cow';
import { getParaswapSellRates, getParaswapSlippage } from '../helpers/paraswap';
import { getSwitchProvider, isSwapViaBackend } from '../helpers/shared/provider.helpers';
import {
  BackendRatesType,
  isBackendRates,
  OrderType,
  ProviderRatesParams,
  SwapParams,
  SwapProvider,
  SwapQuoteType as SwapQuoteType,
  SwapState,
  SwapType,
} from '../types';

interface TokenSelectionParams {
  srcToken: string;
  destToken: string;
  srcDecimals: number;
  destDecimals: number;
  inputSymbol: string;
  outputSymbol: string;
  side: 'buy' | 'sell';
}

export const swapTypesThatRequiresInvertedQuote: SwapType[] = [
  SwapType.DebtSwap,
  SwapType.RepayWithCollateral,
];

const getTokenSelectionForQuote = (
  invertedQuoteRoute: boolean,
  provider: SwapProvider,
  state: SwapState
): TokenSelectionParams => {
  const srcTokenObj = invertedQuoteRoute ? state.destinationToken : state.sourceToken;
  const destTokenObj = invertedQuoteRoute ? state.sourceToken : state.destinationToken;

  // Quote tokens must match what the order will post on, otherwise CoW's per-pair volume-fee policy and gas estimate apply to a different pair than the order and the cushion computed in useSwapOrderAmounts comes out short. Read provider from the active query arg, not state.provider, which lags during provider transitions.
  const usesAddressToSwap =
    state.useFlashloan === false &&
    (provider === SwapProvider.COW_PROTOCOL ||
      (provider === SwapProvider.PARASWAP &&
        state.swapType !== SwapType.WithdrawAndSwap &&
        state.swapType !== SwapType.RepayWithCollateral));

  const srcToken = usesAddressToSwap ? srcTokenObj.addressToSwap : srcTokenObj.underlyingAddress;
  const destToken = usesAddressToSwap ? destTokenObj.addressToSwap : destTokenObj.underlyingAddress;

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
  const side = invertedQuoteRoute ? (state.side === 'buy' ? 'sell' : 'buy') : state.side;

  return {
    srcToken,
    destToken,
    srcDecimals,
    destDecimals,
    inputSymbol,
    outputSymbol,
    side,
  };
};

export const QUOTE_REFETCH_INTERVAL = 30000; // 30 seconds

const getSwapMarketPool = (chainId: number, currentMarketData: MarketDataType) => {
  if (currentMarketData.chainId === chainId) return currentMarketData.addresses.LENDING_POOL;
  return Object.values(marketsData).find(
    (market) => market.chainId === chainId && market.enabledFeatures?.switch
  )?.addresses.LENDING_POOL;
};

export const toSwapTokenInput = (address: string) =>
  isNativeToken(address) ? { native: true as const } : { erc20: evmAddress(address) };

// The backend leaves wallet swap legs unpriced, so USD values still come from CoW's price feed.
const getUsdPrices = async (
  chainId: number,
  srcToken: string,
  destToken: string,
  setError?: (error: Error) => void
) => {
  const prices = new CoWProtocolPricesService();
  const priceAddress = (token: string) =>
    isNativeToken(token) ? getWrappedNativeAddress(chainId) ?? token : token;
  const [srcTokenPriceUsd, destTokenPriceUsd] = await Promise.all([
    prices.getTokenUsdPrice(chainId, priceAddress(srcToken)),
    prices.getTokenUsdPrice(chainId, priceAddress(destToken)),
  ]);
  if (!srcTokenPriceUsd || !destTokenPriceUsd) {
    const error = new Error('No price found for token, please try another token');
    setError?.(error);
    throw error;
  }
  return { srcTokenPriceUsd, destTokenPriceUsd };
};

const usdOf = (value: string, price: string) => BigNumber(value).multipliedBy(price).toString();

/** Ids of the position legs a position swap quote or limit order names. */
export const positionSwapLegs = (state: SwapState, pool: string) => {
  const ids = { chainId: sdkChainId(state.chainId), market: evmAddress(pool) };
  const user = evmAddress(state.user);
  const source = evmAddress(state.sourceToken.underlyingAddress);
  const destination = evmAddress(state.destinationToken.underlyingAddress);
  return {
    user,
    sourceSupply: userSupplyItemId({ ...ids, user, underlyingToken: source }),
    sourceBorrow: userBorrowItemId({ ...ids, user, underlyingToken: source }),
    destinationSupply: userSupplyItemId({ ...ids, user, underlyingToken: destination }),
    destinationReserve: reserveId({ ...ids, underlyingToken: destination }),
  };
};

const fetchPositionSwapQuote = (
  client: AaveClient,
  state: SwapState,
  pool: string,
  amount: string,
  selectedSlippage?: string
) => {
  const legs = positionSwapLegs(state, pool);
  const common = {
    amount: bigDecimal(amount),
    user: legs.user,
    selectedSlippage: selectedSlippage ? bigDecimal(selectedSlippage) : undefined,
  };
  switch (state.swapType) {
    case SwapType.CollateralSwap:
      return supplySwapQuote(client, {
        market: { ...common, sellPosition: legs.sourceSupply, buyReserve: legs.destinationReserve },
      });
    case SwapType.WithdrawAndSwap:
      return withdrawSwapQuote(client, {
        market: {
          ...common,
          sellPosition: legs.sourceSupply,
          buyToken: toSwapTokenInput(state.destinationToken.addressToSwap),
        },
      });
    default:
      throw new Error(`Position swap ${state.swapType} is not placed through the backend`);
  }
};

/**
 * A position swap quoted by the backend, normalized to the UI's orientation: src is the source
 * position. Debt swaps and repays sell the destination leg, so their quote legs are flipped.
 */
const getBackendPositionSwapRates = async ({
  client,
  pool,
  state,
  selectedSlippage,
  setError,
}: {
  client: AaveClient;
  pool: string;
  state: SwapState;
  selectedSlippage?: string;
  setError: (error: Error) => void;
}): Promise<BackendRatesType> => {
  const inverted = swapTypesThatRequiresInvertedQuote.includes(state.swapType);
  const fixesDestination = state.side === 'buy';
  const amount = fixesDestination ? state.debouncedOutputAmount : state.debouncedInputAmount;
  const decimals = fixesDestination ? state.destinationToken.decimals : state.sourceToken.decimals;
  const roundedAmount = BigNumber(amount).decimalPlaces(decimals, BigNumber.ROUND_DOWN).toFixed();

  const srcToken = state.sourceToken.underlyingAddress;
  const destToken = state.destinationToken.underlyingAddress;
  const [result, { srcTokenPriceUsd, destTokenPriceUsd }] = await Promise.all([
    fetchPositionSwapQuote(client, state, pool, roundedAmount, selectedSlippage),
    getUsdPrices(state.chainId, srcToken, destToken, setError),
  ]);
  if (result.isErr()) {
    setError(result.error);
    throw result.error;
  }
  const quote = result.value.quote;
  const srcLeg = inverted ? quote.buy : quote.sell;
  const destLeg = inverted ? quote.sell : quote.buy;
  // The backend solves the leg the user did not fix.
  const afterFees = inverted !== fixesDestination ? quote.finalSell : quote.finalBuy;
  const afterFeesPrice = fixesDestination ? srcTokenPriceUsd : destTokenPriceUsd;

  return {
    srcToken,
    srcSpotAmount: srcLeg.amount.raw,
    srcSpotUSD: usdOf(srcLeg.amount.value, srcTokenPriceUsd),
    srcDecimals: state.sourceToken.decimals,
    destToken,
    destSpotAmount: destLeg.amount.raw,
    destSpotUSD: usdOf(destLeg.amount.value, destTokenPriceUsd),
    destDecimals: state.destinationToken.decimals,
    afterFeesAmount: afterFees.amount.raw,
    afterFeesUSD: usdOf(afterFees.amount.value, afterFeesPrice),
    srcTokenPriceUsd: Number(srcTokenPriceUsd),
    destTokenPriceUsd: Number(destTokenPriceUsd),
    provider: SwapProvider.COW_PROTOCOL,
    suggestedSlippage: BigNumber(quote.suggestedSlippage.value).multipliedBy(100).toNumber(),
    backendQuote: quote,
    market: pool,
  };
};

const getBackendTokenSwapRates = async ({
  client,
  pool,
  chainId,
  user,
  srcToken,
  destToken,
  srcDecimals,
  destDecimals,
  amount,
  side = 'sell',
  selectedSlippage,
  setError,
}: ProviderRatesParams & {
  client: AaveClient;
  pool: string;
  selectedSlippage?: string;
}): Promise<BackendRatesType> => {
  const result = await tokenSwapQuote(client, {
    market: {
      market: evmAddress(pool),
      chainId: sdkChainId(chainId),
      sell: toSwapTokenInput(srcToken),
      buy: toSwapTokenInput(destToken),
      amount: bigDecimal(normalize(amount, side === 'sell' ? srcDecimals : destDecimals)),
      kind: side === 'buy' ? TokenSwapKind.Buy : TokenSwapKind.Sell,
      user: evmAddress(user),
      selectedSlippage: selectedSlippage ? bigDecimal(selectedSlippage) : undefined,
    },
  });
  if (result.isErr()) {
    setError?.(result.error);
    throw result.error;
  }
  const quote = result.value.quote;
  const { srcTokenPriceUsd, destTokenPriceUsd } = await getUsdPrices(
    chainId,
    srcToken,
    destToken,
    setError
  );

  const usd = usdOf;
  // Sell orders solve the buy leg, buy orders the sell leg.
  const finalLeg = side === 'buy' ? quote.finalSell : quote.finalBuy;
  return {
    srcToken,
    srcSpotAmount: quote.sell.amount.raw,
    srcSpotUSD: usd(quote.sell.amount.value, srcTokenPriceUsd),
    srcDecimals,
    destToken,
    destSpotAmount: quote.buy.amount.raw,
    destSpotUSD: usd(quote.buy.amount.value, destTokenPriceUsd),
    destDecimals,
    afterFeesAmount: finalLeg.amount.raw,
    afterFeesUSD: usd(finalLeg.amount.value, side === 'buy' ? srcTokenPriceUsd : destTokenPriceUsd),
    srcTokenPriceUsd: Number(srcTokenPriceUsd),
    destTokenPriceUsd: Number(destTokenPriceUsd),
    provider: SwapProvider.COW_PROTOCOL,
    suggestedSlippage: BigNumber(quote.suggestedSlippage.value).multipliedBy(100).toNumber(),
    backendQuote: quote,
    market: pool,
  };
};

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
    });
  }, [
    state.mainTxState.success,
    state.provider,
    state.chainId,
    state.sourceToken.addressToSwap,
    state.destinationToken.addressToSwap,
    params.swapType,
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
      state.provider == quote.provider &&
      state.swapRate?.srcSpotAmount == quote.srcSpotAmount &&
      state.swapRate?.destSpotAmount == quote.destSpotAmount &&
      state.inputAmount == nextInputAmount &&
      state.outputAmount == nextOutputAmount &&
      state.inputAmountUSD == nextInputAmountUSD &&
      state.outputAmountUSD == nextOutputAmountUSD
    ) {
      return;
    }

    let slippage = state.slippage;
    let autoSlippage = state.autoSlippage;
    if (isBackendRates(quote)) {
      const selected = quote.backendQuote.selectedSlippage;
      autoSlippage = quote.suggestedSlippage.toString();
      slippage = selected ? BigNumber(selected.value).multipliedBy(100).toFixed() : autoSlippage;
    } else if (quote.provider === 'cowprotocol' && quote?.suggestedSlippage !== undefined) {
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

  // Apply incoming quote to state. Discard in-flight responses that arrive after
  // the user has started the approval flow (quoteRefreshPaused) to prevent
  // amount changes that would invalidate the adapter instance address / signature.
  useEffect(() => {
    if (swapQuote) {
      if (state.quoteRefreshPaused) return;

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
        actionsBlocked: {},
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
  const { approvalTxState } = useModalContext();
  const [currentMarket, currentMarketData] = useRootStore(
    useShallow((state) => [state.currentMarket, state.currentMarketData])
  );
  const client = useAaveClient();
  const viaBackend = isSwapViaBackend(provider, params.swapType);
  // Sent only once the user moves off the suggested value, so the quote carries their choice.
  // Limit orders zero the slippage and only use this quote as a price reference.
  const selectedSlippage =
    viaBackend &&
    state.orderType === OrderType.MARKET &&
    state.autoSlippage &&
    state.slippage !== state.autoSlippage
      ? state.slippage
      : undefined;

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

  const { srcToken, destToken, srcDecimals, destDecimals, inputSymbol, outputSymbol, side } =
    useMemo(
      () => getTokenSelectionForQuote(requiresQuoteInverted, provider, state),
      [
        provider,
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
          if (viaBackend) {
            const pool = getSwapMarketPool(state.chainId, currentMarketData);
            if (!pool) {
              setError(new Error('No market found in the selected chain for this pair'));
              return null;
            }
            if (params.swapType !== SwapType.Swap) {
              return await getBackendPositionSwapRates({
                client,
                pool,
                state,
                selectedSlippage,
                setError,
              });
            }
            return await getBackendTokenSwapRates({
              client,
              pool,
              selectedSlippage,
              swapType: state.swapType,
              chainId: state.chainId,
              amount,
              srcToken,
              destToken,
              user: state.user,
              srcDecimals,
              destDecimals,
              appCode,
              market: currentMarket,
              setError,
              side,
            });
          }
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
            appCode,
            market: currentMarket,
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
            market: currentMarket,
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
    queryKey: [
      ...queryKeysFactory.swapQuote(
        state.chainId,
        provider,
        amount,
        requiresQuoteInverted,
        srcToken,
        destToken,
        state.user,
        currentMarket
      ),
      viaBackend,
      selectedSlippage,
    ],
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
        hasPositiveUserAmount &&
        !isSameTokenPair &&
        !isFlashloanDisabled &&
        !state.mainTxState.success &&
        !state.mainTxState.txHash && // Don't fetch quotes once transaction is sent
        !state.mainTxState.loading && // Don't fetch quotes while transaction is processing
        !approvalTxState?.loading && // Don't fetch quotes while approval is processing
        !approvalTxState?.success && // Don't fetch quotes while approval is successful
        !state.quoteRefreshPaused && // Respect paused refresh state (e.g. after approval or manual edits)
        provider !== SwapProvider.NONE &&
        !state.isWrongNetwork
      );
    })(),
    retry: 0,
    throwOnError: false,
    refetchOnWindowFocus: false,
    refetchInterval: (() => {
      const isInsufficientBalance = hasInsufficientBalance(state);
      const isFlashloanDisabled = hasFlashLoanDisabled(state);

      return !state.actionsLoading &&
        !state.quoteRefreshPaused &&
        !state.mainTxState.success &&
        !state.mainTxState.txHash &&
        !state.mainTxState.loading &&
        !approvalTxState?.loading &&
        !approvalTxState?.success &&
        !isInsufficientBalance &&
        !isFlashloanDisabled
        ? QUOTE_REFETCH_INTERVAL
        : false;
    })(),
  });
};
