import { BigNumberValue, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { Dispatch, useEffect, useMemo } from 'react';
import { useRootStore } from 'src/store/root';
import { queryKeysFactory } from 'src/ui-config/queries';

import { SwapInputChanges } from '../analytics/constants';
import { TrackAnalyticsHandlers } from '../analytics/useTrackAnalytics';
import { SESSION_STORAGE_EXPIRY_MS } from '../constants/shared.constants';
import {
  OrderType,
  SwappableToken,
  swappableTokenToTokenInfo,
  SwapParams,
  SwapState,
  SwapType,
  TokenType,
} from '../types';
import { LimitOrderInputs } from './LimitOrderInputs';
import { MarketOrderInputs } from './MarketOrderInputs';

export type SwapInputState = {
  handleSelectedInputToken: (token: SwappableToken) => void;
  handleSelectedOutputToken: (token: SwappableToken) => void;
  handleSelectedNetworkChange: (value: number) => void;
  setSlippage: (value: string) => void;
  showNetworkSelector: boolean;
  inputAssets: SwappableToken[];
  outputAssets: SwappableToken[];
  handleInputChange: (value: string) => void;
  handleOutputChange: (value: string) => void;
  handleRateChange: (rateFromAsset: SwappableToken, newRate: BigNumberValue) => void;
  onSwitchReserves: () => void;
};

/**
 * Input surface for both market and limit orders.
 *
 * Responsibilities:
 * - Manage input/output amount edits, max selection, and switching tokens
 * - Pause automatic quote refresh when user makes manual price/amount edits
 * - Persist last token selection per swap type + chain in sessionStorage (with expiry)
 * - Filter token lists to avoid wrapping paths and native token pitfalls for SCWs
 */
export const SwapInputs = ({
  params,
  state,
  setState,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const resetErrorsAndWarnings = () => {
    setState({
      error: undefined,
      warnings: [],
      actionsBlocked: false,
      actionsLoading: false,
    });
  };

  const handleInputChange = (value: string) => {
    resetErrorsAndWarnings();

    if (state.orderType === OrderType.LIMIT && state.swapRate) {
      // Manual edit should pause quote refresh
      setState({ quoteRefreshPaused: true });
    }

    if (value === '-1') {
      // Max Selected
      setState({
        quoteRefreshPaused: false,
        quoteLastUpdatedAt: undefined,
        quoteTimerPausedAt: undefined,
        quoteTimerPausedAccumMs: undefined,
        inputAmount: state.sourceToken.balance,
        isMaxSelected: true,
        side: 'sell',
      });
    } else {
      setState({
        quoteRefreshPaused: false,
        quoteLastUpdatedAt: undefined,
        quoteTimerPausedAt: undefined,
        quoteTimerPausedAccumMs: undefined,
        inputAmount: value,
        isMaxSelected: value === state.forcedMaxValue,
        side: 'sell',
      });
    }

    trackingHandlers.trackInputChange(SwapInputChanges.INPUT_AMOUNT, value);
    resetErrorsAndWarnings();
  };

  const handleOutputChange = (value: string) => {
    if (state.swapRate) {
      // Block quote refreshs if user is changing the output amount after getting quotes
      setState({ quoteRefreshPaused: true });
    }

    if (value === '-1') {
      setState({
        quoteRefreshPaused: false,
        quoteLastUpdatedAt: undefined,
        quoteTimerPausedAt: undefined,
        quoteTimerPausedAccumMs: undefined,
        outputAmount: state.destinationToken.balance,
        isMaxSelected: true,
        side: 'buy',
      });
    } else {
      setState({
        quoteRefreshPaused: false,
        quoteLastUpdatedAt: undefined,
        quoteTimerPausedAt: undefined,
        quoteTimerPausedAccumMs: undefined,
        outputAmount: value,
        isMaxSelected: false,
        side: 'buy',
      });
    }

    trackingHandlers.trackInputChange(SwapInputChanges.OUTPUT_AMOUNT, value);
    resetErrorsAndWarnings();
    setState({
      outputAmount: value,
      debouncedOutputAmount: value,
    });
  };

  const handleRateChange = (rateFromAsset: SwappableToken, newRate: BigNumberValue) => {
    // User changed custom price, pause quote refresh in limit orders
    setState({ quoteRefreshPaused: true });

    // When rate is changed, new output amount is calculated based on the input amount
    let newOutputAmount: string;
    if (rateFromAsset.addressToSwap === state.sourceToken.addressToSwap) {
      newOutputAmount = valueToBigNumber(state.inputAmount).multipliedBy(newRate).toString();
    } else {
      newOutputAmount = valueToBigNumber(state.outputAmount).dividedBy(newRate).toString();
    }

    setState({
      quoteRefreshPaused: false,
      quoteLastUpdatedAt: undefined,
      quoteTimerPausedAt: undefined,
      quoteTimerPausedAccumMs: undefined,
      outputAmount: newOutputAmount,
      isMaxSelected: false,
      side: 'sell',
    });

    trackingHandlers.trackInputChange(SwapInputChanges.RATE_CHANGE, newRate.toString());
    resetErrorsAndWarnings();
  };

  const onSwitchReserves = () => {
    const fromToken = state.sourceToken;
    const toToken = state.destinationToken;
    const toInput = state.swapRate
      ? normalizeBN(state.swapRate.destSpotAmount, state.swapRate.destDecimals).toString()
      : '0';

    setState({
      quoteRefreshPaused: false,
      quoteLastUpdatedAt: undefined,
      quoteTimerPausedAt: undefined,
      quoteTimerPausedAccumMs: undefined,
      sourceToken: toToken,
      destinationToken: fromToken,
      inputAmount: '',
      debouncedInputAmount: '',
      outputAmount: toInput,
      debouncedOutputAmount: toInput,
      inputAmountUSD: '',
      outputAmountUSD: '',
      ratesLoading: false,
      swapRate: undefined,
      actionsLoading: false,
      slippage: '0.1',
      actionsBlocked: false,
      error: undefined,
      warnings: [],
    });

    trackingHandlers.trackInputChange(SwapInputChanges.SWITCH_RESERVES, 'switched');
    resetErrorsAndWarnings();
    resetSwap('both');
  };

  const queryClient = useQueryClient();
  const user = useRootStore((store) => store.account);

  const addNewToken = async (token: SwappableToken) => {
    queryClient.setQueryData<SwappableToken[]>(
      queryKeysFactory.tokensBalance(
        state.sourceTokens.concat(state.destinationTokens).map(swappableTokenToTokenInfo) ?? [],
        state.chainId,
        user
      ),
      (oldData) => {
        if (oldData)
          return [...oldData, token].sort((a, b) => Number(b.balance) - Number(a.balance));
        return [token];
      }
    );
    const customTokens = localStorage.getItem('customTokens');
    const newTokenInfo: SwappableToken = {
      addressToSwap: token.addressToSwap,
      addressForUsdPrice: token.addressForUsdPrice,
      underlyingAddress: token.underlyingAddress,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      chainId: token.chainId,
      balance: token.balance,
      logoURI: token.logoURI,
      tokenType: TokenType.USER_CUSTOM,
    };
    if (customTokens) {
      const parsedCustomTokens: SwappableToken[] = JSON.parse(customTokens);
      parsedCustomTokens.push(newTokenInfo);
      localStorage.setItem('customTokens', JSON.stringify(parsedCustomTokens));
    } else {
      localStorage.setItem('customTokens', JSON.stringify([newTokenInfo]));
    }
    trackingHandlers.trackInputChange(SwapInputChanges.ADD_CUSTOM_TOKEN, token.symbol);
  };

  const handleSelectedInputToken = (token: SwappableToken) => {
    if (!state.sourceTokens?.find((t) => t.addressToSwap === token.addressToSwap)) {
      addNewToken(token).then(() => {
        setState({
          sourceToken: token,
          inputAmount: '',
          debouncedInputAmount: '',
          inputAmountUSD: '',
          quoteRefreshPaused: false,
          quoteTimerPausedAt: undefined,
          quoteTimerPausedAccumMs: undefined,
          error: undefined,
          warnings: [],
          actionsBlocked: false,
          actionsLoading: false,
        });
        saveTokenSelection(token, state.destinationToken);
        saveRecentToken('input', token);
        resetErrorsAndWarnings();
      });
    } else {
      setState({
        sourceToken: token,
        inputAmount: '',
        debouncedInputAmount: '',
        inputAmountUSD: '',
        quoteRefreshPaused: false,
        quoteTimerPausedAt: undefined,
        quoteTimerPausedAccumMs: undefined,
        error: undefined,
        warnings: [],
        actionsBlocked: false,
        actionsLoading: false,
      });
      saveTokenSelection(token, state.destinationToken);
      saveRecentToken('input', token);
      resetErrorsAndWarnings();
    }
    trackingHandlers.trackInputChange(SwapInputChanges.INPUT_TOKEN, token.symbol);
  };

  // Persist selected tokens in session storage to retain them on modal close/open but differentiating by modalType
  const getStorageKey = (swapType: SwapType, chainId: number) => {
    // if (SwapType.CollateralSwap === swapType) {
    //   return `aave_switch_tokens_${swapType}_${chainId}_${state.sourceToken?.addressToSwap?.toLowerCase()}`;
    // } else {
    return `aave_switch_tokens_${swapType}_${chainId}`;
    // }
  };

  const handleSelectedOutputToken = (token: SwappableToken) => {
    if (!state.destinationTokens?.find((t) => t.addressToSwap === token.addressToSwap)) {
      addNewToken(token).then(() => {
        setState({
          destinationToken: token,
          outputAmount: '',
          debouncedOutputAmount: '',
          outputAmountUSD: '',
          quoteRefreshPaused: false,
          quoteTimerPausedAt: undefined,
          quoteTimerPausedAccumMs: undefined,
          error: undefined,
          warnings: [],
          actionsBlocked: false,
          actionsLoading: false,
        });
        saveTokenSelection(state.sourceToken, token);
        saveRecentToken('output', token);
        resetErrorsAndWarnings();
      });
    } else {
      setState({
        destinationToken: token,
        outputAmount: '',
        debouncedOutputAmount: '',
        outputAmountUSD: '',
        quoteRefreshPaused: false,
        quoteTimerPausedAt: undefined,
        quoteTimerPausedAccumMs: undefined,
        error: undefined,
        warnings: [],
        actionsBlocked: false,
        actionsLoading: false,
      });
      saveTokenSelection(state.sourceToken, token);
      saveRecentToken('output', token);
      resetErrorsAndWarnings();
    }
    trackingHandlers.trackInputChange(SwapInputChanges.OUTPUT_TOKEN, token.symbol);
  };

  const saveTokenSelection = (inputToken: SwappableToken, outputToken: SwappableToken) => {
    try {
      sessionStorage.setItem(
        getStorageKey(params.swapType, state.chainId),
        JSON.stringify({
          inputToken: params.forcedInputToken ? null : inputToken,
          outputToken: params.forcedOutputToken ? null : outputToken,
          timestamp: Date.now(),
        })
      );
    } catch (e) {
      console.error('Error saving token selection', e);
    }
  };

  const getRecentStorageKey = (swapType: SwapType, chainId: number, side: 'input' | 'output') =>
    `aave_recent_tokens_${swapType}_${chainId}_${side}`;

  const saveRecentToken = (side: 'input' | 'output', token: SwappableToken) => {
    try {
      const key = getRecentStorageKey(params.swapType, state.chainId, side);
      const raw = localStorage.getItem(key);
      const list: string[] = raw ? JSON.parse(raw) : [];
      const addr = token.addressToSwap.toLowerCase();
      const next = [addr, ...list.filter((a) => a.toLowerCase() !== addr)];
      localStorage.setItem(key, JSON.stringify(next.slice(0, 8)));
    } catch (e) {
      // ignore storage errors
    }
  };

  const loadTokenSelection = () => {
    try {
      const savedTokenSelection = sessionStorage.getItem(
        getStorageKey(params.swapType, state.chainId)
      );
      if (!savedTokenSelection) return null;

      const parsedTokenSelection = JSON.parse(savedTokenSelection);
      if (
        parsedTokenSelection.timestamp &&
        Date.now() - parsedTokenSelection.timestamp > SESSION_STORAGE_EXPIRY_MS
      ) {
        sessionStorage.removeItem(getStorageKey(params.swapType, state.chainId));
        return null;
      }
      return parsedTokenSelection;
    } catch (e) {
      return null;
    }
  };

  // TODO: Can we simplify?
  const { defaultInputToken: fallbackInputToken, defaultOutputToken: fallbackOutputToken } =
    useMemo(() => {
      let auxInputToken = params.forcedInputToken || params.suggestedDefaultInputToken;
      let auxOutputToken = params.forcedOutputToken || params.suggestedDefaultOutputToken;

      const fromList = params.sourceTokens;
      const toList = params.destinationTokens;

      if (!auxInputToken) {
        auxInputToken = fromList.find(
          (token) =>
            (token.balance !== '0' || token.tokenType === TokenType.NATIVE) &&
            token.symbol !== 'GHO'
        );
      }

      if (!auxOutputToken) {
        auxOutputToken = toList.find((token) => token.symbol === 'GHO');
      }

      return {
        defaultInputToken: auxInputToken ?? fromList[0],
        defaultOutputToken: auxOutputToken ?? toList[1],
      };
    }, [params.sourceTokens, params.destinationTokens]);

  // Helper to check if two tokens are the same (by addressToSwap, underlyingAddress, or symbol)
  const areTokensEqual = (
    token1: SwappableToken | undefined,
    token2: SwappableToken | undefined
  ): boolean => {
    if (!token1 || !token2) return false;
    return (
      token1.addressToSwap.toLowerCase() === token2.addressToSwap.toLowerCase() ||
      token1.underlyingAddress.toLowerCase() === token2.underlyingAddress.toLowerCase() ||
      token1.symbol === token2.symbol
    );
  };

  // Update selected tokens when defaults change (e.g., after network change)
  useEffect(() => {
    const saved = loadTokenSelection();

    let inputToken: SwappableToken | undefined;
    let outputToken: SwappableToken | undefined;

    // Determine input token first (prioritize forced, then saved if valid, else fallback)
    if (params.forcedInputToken) {
      inputToken = params.forcedInputToken;
    } else if (saved?.inputToken) {
      // Only use saved input token if it doesn't match the intended output
      const intendedOutput = params.forcedOutputToken || saved.outputToken || fallbackOutputToken;
      if (!areTokensEqual(saved.inputToken, intendedOutput)) {
        inputToken = saved.inputToken;
      } else {
        inputToken = fallbackInputToken;
      }
    } else {
      inputToken = fallbackInputToken;
    }

    // Determine output token (prioritize forced, then saved if valid, else fallback)
    if (params.forcedOutputToken) {
      outputToken = params.forcedOutputToken;
    } else if (saved?.outputToken) {
      // Only use saved output token if it doesn't match the input token
      if (!areTokensEqual(saved.outputToken, inputToken)) {
        outputToken = saved.outputToken;
      } else {
        outputToken = fallbackOutputToken;
      }
    } else {
      outputToken = fallbackOutputToken;
    }

    // Final safety check: if input and output tokens still match, reset output to fallback
    if (areTokensEqual(inputToken, outputToken)) {
      outputToken = fallbackOutputToken;
    }

    setState({
      sourceToken: inputToken ?? fallbackInputToken,
      destinationToken: outputToken ?? fallbackOutputToken,
    });
  }, [
    params.forcedInputToken,
    params.forcedOutputToken,
    fallbackInputToken,
    fallbackOutputToken,
    state.chainId,
  ]);

  const resetSwap = (side: 'source' | 'destination' | 'both') => {
    setState({ error: undefined });
    // Reset input amount when changing networks
    if (side === 'source') {
      setState({ inputAmount: '' });
      setState({ debouncedInputAmount: '' });
    } else if (side === 'destination') {
      setState({ outputAmount: '' });
      setState({ debouncedOutputAmount: '' });
    } else {
      setState({ debouncedInputAmount: '' });
      setState({ debouncedOutputAmount: '' });
    }
    resetErrorsAndWarnings();
  };

  const handleSelectedNetworkChange = (value: number) => {
    setState({ chainId: value });
    resetSwap('both');

    params.refreshTokens(value);
    trackingHandlers.trackInputChange(SwapInputChanges.NETWORK, value.toString());
  };

  const setSlippage = (value: string) => {
    setState({ slippage: value });
    if (state.slippage !== state.autoSlippage) {
      // Pause automatic quote refresh only in market orders when slippage is edited by user
      setState({ quoteRefreshPaused: true });
    }
    trackingHandlers.trackInputChange(SwapInputChanges.SLIPPAGE, value);
  };

  const showNetworkSelector = params.showNetworkSelector && !!params.supportedNetworks.length;

  // Debounce input and output amounts before triggering quote logic
  useEffect(() => {
    const t = setTimeout(() => {
      setState({ debouncedInputAmount: state.inputAmount });
    }, 400);
    return () => clearTimeout(t);
  }, [state.inputAmount]);

  useEffect(() => {
    const t = setTimeout(() => {
      setState({ debouncedOutputAmount: state.outputAmount });
    }, 400);
    return () => clearTimeout(t);
  }, [state.outputAmount]);

  const inputAssets = useMemo(
    () =>
      state.sourceTokens.filter(
        (token) =>
          // Filter out tokens that match the destination token by addressToSwap OR underlyingAddress
          // This prevents the same asset from appearing in both lists (e.g., USDT in CollateralSwap)
          token.addressToSwap.toLowerCase() !==
            state.destinationToken.addressToSwap.toLowerCase() &&
          token.underlyingAddress.toLowerCase() !==
            state.destinationToken.underlyingAddress.toLowerCase() &&
          Number(token.balance) !== 0 &&
          // Remove native tokens for non-Safe smart contract wallets
          !(
            state.userIsSmartContractWallet &&
            !state.userIsSafeWallet &&
            token.tokenType === TokenType.NATIVE
          ) &&
          // Avoid wrapping
          !(
            state.destinationToken.tokenType === TokenType.NATIVE &&
            typeof state.chainId === 'number' &&
            token.addressToSwap.toLowerCase() ===
              WRAPPED_NATIVE_CURRENCIES[
                state.chainId as keyof typeof WRAPPED_NATIVE_CURRENCIES
              ]?.address.toLowerCase()
          ) &&
          !(
            state.destinationToken.addressToSwap.toLowerCase() ===
              WRAPPED_NATIVE_CURRENCIES[
                state.chainId as keyof typeof WRAPPED_NATIVE_CURRENCIES
              ]?.address.toLowerCase() && token.tokenType === TokenType.NATIVE
          )
      ),
    [
      state.sourceTokens,
      state.destinationToken.addressToSwap,
      state.destinationToken.underlyingAddress,
      state.destinationToken.tokenType,
      state.userIsSmartContractWallet,
      state.userIsSafeWallet,
      state.chainId,
    ]
  );

  const outputAssets = useMemo(
    () =>
      state.destinationTokens.filter(
        (token) =>
          // Filter out tokens that match the source token by addressToSwap OR underlyingAddress
          // This prevents the same asset from appearing in both lists (e.g., USDT in CollateralSwap)
          token.addressToSwap.toLowerCase() !== state.sourceToken.addressToSwap.toLowerCase() &&
          token.underlyingAddress.toLowerCase() !==
            state.sourceToken.underlyingAddress.toLowerCase() &&
          // Avoid wrapping
          !(
            state.sourceToken.tokenType === TokenType.NATIVE &&
            typeof state.chainId === 'number' &&
            token.addressToSwap.toLowerCase() ===
              WRAPPED_NATIVE_CURRENCIES[
                state.chainId as keyof typeof WRAPPED_NATIVE_CURRENCIES
              ]?.address.toLowerCase()
          ) &&
          !(
            state.sourceToken.addressToSwap.toLowerCase() ===
              WRAPPED_NATIVE_CURRENCIES[
                state.chainId as keyof typeof WRAPPED_NATIVE_CURRENCIES
              ]?.address.toLowerCase() && token.tokenType === TokenType.NATIVE
          )
      ),
    [
      state.destinationTokens,
      state.sourceToken.addressToSwap,
      state.sourceToken.underlyingAddress,
      state.sourceToken.tokenType,
      state.chainId,
    ]
  );

  const swapState: SwapInputState = {
    handleSelectedInputToken,
    handleSelectedOutputToken,
    handleSelectedNetworkChange,
    setSlippage,
    showNetworkSelector,
    inputAssets,
    outputAssets,
    handleInputChange,
    handleOutputChange,
    handleRateChange,
    onSwitchReserves,
  };

  if (state.orderType === OrderType.MARKET) {
    return (
      <MarketOrderInputs params={params} state={state} swapState={swapState} setState={setState} />
    );
  } else if (state.orderType === OrderType.LIMIT) {
    return (
      <LimitOrderInputs params={params} state={state} swapState={swapState} setState={setState} />
    );
  }
};
