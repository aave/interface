import { Dispatch, useEffect } from 'react';

import { validateSlippage, ValidationSeverity } from '../helpers/shared/slippage.helpers';
import { isCowProtocolRates, SwapParams, SwapState, TokenType } from '../types';

/**
 * Keeps slippage-related UI/validation in sync with user input and provider hints.
 *
 * - Surfaces a warning when user slippage is below provider suggestion (CoW)
 * - Validates input and derives `safeSlippage` for guards and calculations
 */
export const useSlippageSelector = ({
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
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
  }, [state.slippage]);

  useEffect(() => {
    const slippageValidation = validateSlippage(
      state.slippage,
      state.chainId,
      state.sourceToken.tokenType === TokenType.NATIVE,
      state.provider
    );

    const safeSlippage =
      slippageValidation && slippageValidation.severity === ValidationSeverity.ERROR
        ? 0
        : Number(state.slippage) / 100;

    setState({
      slippageValidation,
      safeSlippage,
    });
  }, [state.slippage]);
};
