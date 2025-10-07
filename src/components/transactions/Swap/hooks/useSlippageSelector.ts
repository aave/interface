import { Dispatch, useEffect, useMemo } from 'react';

import { getParaswapSlippage } from '../helpers/paraswap/misc.helpers';
import { validateSlippage, ValidationSeverity } from '../helpers/shared/slippage.helpers';
import { isCowProtocolRates, SwapParams, SwapState, SwapType, TokenType } from '../types';

export const useSlippageSelector = ({
  params,
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  useEffect(() => {
    if (state.swapRate?.provider == 'cowprotocol' && isCowProtocolRates(state.swapRate)) {
      setState({ slippage: state.swapRate.suggestedSlippage.toString() });
    } else if (params.swapType === SwapType.CollateralSwap && state.useFlashloan === true) {
      const paraswapSlippage = getParaswapSlippage(
        state.sourceToken.symbol || '',
        state.destinationToken.symbol || ''
      );
      setState({ slippage: paraswapSlippage });
    }
  }, [
    state.swapRate,
    state.useFlashloan,
    params.swapType,
    state.sourceToken.symbol,
    state.destinationToken.symbol,
  ]);

  useEffect(() => {
    // Debounce to avoid race condition
    const timeout = setTimeout(() => {
      setState({
        showSlippageWarning:
          isCowProtocolRates(state.swapRate) &&
          Number(state.slippage) < state.swapRate?.suggestedSlippage,
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [state.slippage, state.swapRate]);

  const slippageValidation = validateSlippage(
    state.slippage,
    state.chainId,
    state.sourceToken.tokenType === TokenType.NATIVE,
    state.swapRate?.provider
  );

  const safeSlippage =
    slippageValidation && slippageValidation.severity === ValidationSeverity.ERROR
      ? 0
      : Number(state.slippage) / 100;

  // wether we use cow's suggested slippage or paraswap's correlated assets slippage default
  const autoSlippage = useMemo(() => {
    if (!state.swapRate) return undefined;

    if (state.swapRate.provider === 'cowprotocol') {
      return state.swapRate.suggestedSlippage?.toString();
    }

    if (state.swapRate.provider === 'paraswap') {
      return getParaswapSlippage(
        state.sourceToken.symbol || '',
        state.destinationToken.symbol || ''
      );
    }

    return undefined;
  }, [
    state.swapRate?.provider,
    state.swapRate?.suggestedSlippage,
    state.sourceToken.symbol,
    state.destinationToken.symbol,
  ]);

  useEffect(() => {
    setState({ slippageValidation });
  }, [slippageValidation]);

  useEffect(() => {
    setState({ safeSlippage });
  }, [safeSlippage]);

  useEffect(() => {
    setState({ autoSlippage });
  }, [autoSlippage]);
};
