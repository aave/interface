import { Dispatch, useEffect, useRef } from 'react';

import { validateSlippage, ValidationSeverity } from '../helpers/shared/slippage.helpers';
import { isCowProtocolRates, OrderType, SwapParams, SwapState, TokenType } from '../types';

/**
/**
 * Hook responsibilities:
 * - Synchronizes the slippage value in state with the selected order type (MARKET or LIMIT), restoring previous market slippage as needed.
 * - Tracks the last non-zero market slippage to allow restoration when toggling between order types.
 * - Triggers slippage warnings for the user if their input value is below the provider's suggested minimum for CoW Protocol swaps.
 * - Validates the slippage value and updates related state/validation UI.
 * - Keeps UI/validation in sync with both user input and provider hints or requirements.
 */
export const useSlippageSelector = ({
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  // Track last non-zero market slippage to restore when switching back from LIMIT
  const lastMarketSlippageRef = useRef<string | null>(null);

  // Keep slippage aligned with order type globally
  useEffect(() => {
    if (state.orderType === OrderType.LIMIT) {
      // Remember current market slippage if non-zero before forcing to 0 for limit
      if (state.slippage && Number(state.slippage) !== 0) {
        lastMarketSlippageRef.current = state.slippage;
      }
      if (state.slippage !== '0') {
        setState({ slippage: '0' });
      }
    } else if (state.orderType === OrderType.MARKET) {
      // Restore to suggested slippage if available, otherwise last known market slippage, else default 0.10%
      const target = lastMarketSlippageRef.current || state.autoSlippage || '0.10';
      if (state.slippage !== target) {
        setState({ slippage: target });
      }
    }
  }, [state.orderType]);

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
    if (!state.swapRate) return;

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
  }, [state.slippage, state.swapRate]);
};
