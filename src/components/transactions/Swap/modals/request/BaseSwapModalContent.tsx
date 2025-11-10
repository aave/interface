import { CircularProgress } from '@mui/material';
import { useEffect, useReducer } from 'react';
import { useModalContext } from 'src/hooks/useModal';

import { BaseSwapActions } from '../../actions';
import { SwapInputChanges } from '../../analytics/constants';
import { useHandleAnalytics } from '../../analytics/useTrackAnalytics';
import { BaseSwapDetails } from '../../details';
import { SwapErrors } from '../../errors/SwapErrors';
import { useFlowSelector } from '../../hooks/useFlowSelector';
import { useMaxNativeAmount } from '../../hooks/useMaxNativeAmount';
import { useProtocolReserves } from '../../hooks/useProtocolReserves';
import { useSlippageSelector } from '../../hooks/useSlippageSelector';
import { useSwapOrderAmounts } from '../../hooks/useSwapOrderAmounts';
import { useSwapQuote } from '../../hooks/useSwapQuote';
import { useUserContext } from '../../hooks/useUserContext';
import { SwapInputs } from '../../inputs/SwapInputs';
import { OrderTypeSelector } from '../../shared/OrderTypeSelector';
import { SwapModalTitle } from '../../shared/SwapModalTitle';
import {
  OrderType,
  SwapDefaultParams,
  swapDefaultState,
  SwapParams,
  SwapState,
  swapStateFromParamsOrDefault,
} from '../../types';
import { SwapPostInputWarnings } from '../../warnings/SwapPostInputWarnings';
import { SwapPreInputWarnings } from '../../warnings/SwapPreInputWarnings';
import { SwapResultView } from '../result/SwapResultView';
import { NoEligibleAssetsToSwap } from './NoEligibleAssetsToSwap';

/**
 * Core composition root for all Swap modals.
 *
 * Responsibilities:
 * - Build immutable `params` from defaults + overrides
 * - Initialize and own `SwapState`; expose a guarded `setState` that avoids no-op updates
 * - Wire all domain hooks (user context, max native amount, slippage validation, flow selection (HF/flashloan), quotes, protocol reserves, processed amounts, analytics)
 * - Gate details, warnings, errors and actions until the flow is selected (prevents flicker while HF/flashloan decision is pending for protocol flows)
 * - Render fallback views when tokens are not available/loaded
 */
export const BaseSwapModalContent = ({
  params: predefinedParams,
}: {
  params: Partial<SwapParams>;
}) => {
  const params = {
    ...SwapDefaultParams,
    ...predefinedParams,
  } as SwapParams;

  // Shared core state for all the components
  const [state, setStateBase] = useReducer(
    (state: SwapState, action: Partial<SwapState>): SwapState => {
      const newState = { ...state, ...action } as SwapState;
      return newState;
    },
    swapStateFromParamsOrDefault(params, swapDefaultState)
  );

  // Wrapped setter that avoids re-render churn when no fields change
  const setState = (action: Partial<SwapState>) => {
    const hasChange = Object.entries(action).some(
      ([key, value]) => !Object.is(state[key as keyof SwapState], value)
    );

    if (!hasChange) {
      // optional: debug log
      console.debug(
        '%c[BaseSwapModalContent] setState skipped (no changes). Check renderings for %o',
        'color: #b0b0b0;',
        action
      );
      return;
    }

    console.debug(
      '%c[BaseSwapModalContent] setState called. Fields changed: %o Values: %o',
      'color: #b0b0b0;',
      Object.keys(action),
      action
    );

    setStateBase(action);
  };

  // Load specific states via hooks
  const { mainTxState } = useModalContext();
  useEffect(() => {
    setState({ mainTxState });
  }, [mainTxState]);
  const trackingHandlers = useHandleAnalytics({ state });
  useUserContext({ setState });
  useMaxNativeAmount({ params, state, setState });
  useSlippageSelector({ params, state, setState });
  useFlowSelector({ params, state, setState });
  useSwapQuote({ params, state, setState, trackingHandlers });
  useProtocolReserves({ params, state, setState });
  useSwapOrderAmounts({ params, state, setState });

  // Fallback views
  if (!state.sourceTokens.length || !state.destinationTokens.length) {
    return <NoEligibleAssetsToSwap />;
  }

  if (!state.sourceToken || !state.destinationToken) {
    return <CircularProgress />;
  }

  // Order result view
  if (mainTxState.success) {
    return <SwapResultView params={params} state={state} trackingHandlers={trackingHandlers} />;
  }

  return (
    <>
      {params.showTitle && <SwapModalTitle params={params} state={state} />}

      {params.allowLimitOrders && (
        <OrderTypeSelector
          switchType={state.orderType}
          limitsOrderButtonBlocked={state.limitsOrderButtonBlocked ?? false}
          setSwitchType={(orderType: OrderType) => {
            const switchingFromLimitToMarket =
              state.orderType === OrderType.LIMIT && orderType === OrderType.MARKET;
            const switchingFromMarketToLimit =
              state.orderType === OrderType.MARKET && orderType === OrderType.LIMIT;

            setState({
              orderType,
              actionsLoading: false,
              ...(switchingFromLimitToMarket || switchingFromMarketToLimit
                ? {
                    inputAmount: '',
                    debouncedInputAmount: '',
                    inputAmountUSD: '',
                    outputAmount: '',
                    debouncedOutputAmount: '',
                    outputAmountUSD: '',
                    swapRate: undefined,
                    error: undefined,
                    isLiquidatable: false,
                    warnings: [],
                    quoteRefreshPaused: false,
                    quoteLastUpdatedAt: undefined,
                    quoteTimerPausedAt: null,
                    quoteTimerPausedAccumMs: 0,
                  }
                : {}),
            });
            trackingHandlers.trackInputChange(SwapInputChanges.ORDER_TYPE, orderType.toString());
          }}
        />
      )}

      <SwapPreInputWarnings
        params={params}
        state={state}
        // read-only
      />

      <SwapInputs
        params={params}
        state={state}
        setState={setState}
        trackingHandlers={trackingHandlers}
      />

      {/* Show provider and validation errors early when flow is not yet selected */}
      {!state.isSwapFlowSelected && (
        <SwapErrors
          params={params}
          state={state}
          setState={setState}
          trackingHandlers={trackingHandlers}
        />
      )}

      {/* 
                Show details, warnings, and actions only if the swap flow is selected. 
                This is particularly useful for Adapers where the swap may be via flashloan or not. 
            */}
      {state.isSwapFlowSelected && (
        <>
          <BaseSwapDetails
            params={params}
            state={state}
            // read-only
          />

          <SwapPostInputWarnings
            params={params}
            state={state}
            setState={setState} // allows bypassing warnings
          />

          {/* Keep original ordering: errors appear after post-input warnings, before actions */}
          <SwapErrors
            params={params}
            state={state}
            setState={setState}
            trackingHandlers={trackingHandlers}
          />

          <BaseSwapActions
            params={params}
            state={state}
            setState={setState}
            trackingHandlers={trackingHandlers}
          />
        </>
      )}
    </>
  );
};
