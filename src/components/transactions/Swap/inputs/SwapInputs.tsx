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
        inputAmount: state.sourceToken.balance,
        debouncedInputAmount: state.sourceToken.balance,
        isMaxSelected: true,
        side: 'sell',
      });
    } else {
      setState({
        inputAmount: value,
        debouncedInputAmount: value,
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
        outputAmount: state.destinationToken.balance,
        debouncedOutputAmount: state.destinationToken.balance,
        isMaxSelected: true,
        side: 'buy',
      });
    } else {
      setState({
        outputAmount: value,
        debouncedOutputAmount: value,
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
      outputAmount: newOutputAmount,
      debouncedOutputAmount: newOutputAmount,
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
    console.log('handleSelectedInputToken', token);
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

  // Update selected tokens when defaults change (e.g., after network change)
  useEffect(() => {
    if (params.forcedInputToken) {
      setState({ sourceToken: params.forcedInputToken });
    } else {
      // If saved use it
      const saved = loadTokenSelection();
      if (saved?.inputToken) {
        setState({ sourceToken: saved.inputToken });
      } else {
        setState({ sourceToken: fallbackInputToken });
      }
    }

    if (params.forcedOutputToken) {
      setState({ destinationToken: params.forcedOutputToken });
    } else {
      // If saved use it
      const saved = loadTokenSelection();
      if (saved?.outputToken) {
        setState({ destinationToken: saved.outputToken });
      } else {
        setState({ destinationToken: fallbackOutputToken });
      }
    }
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

  const inputAssets = useMemo(
    () =>
      state.sourceTokens.filter(
        (token) =>
          token.addressToSwap !== state.destinationToken.addressToSwap &&
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
          token.addressToSwap !== state.sourceToken.addressToSwap &&
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
