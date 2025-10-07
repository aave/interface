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
  const [state, setState] = useReducer(
    (state: SwapState, action: Partial<SwapState>): SwapState => {
      // Debug: log which fields are being changed
      const changedFields = Object.keys(action);
      // Debug: log which fields are being changed, with light gray text color
      console.debug(
        '%c[BaseSwapModalContent] setState called. Fields changed: %o Values: %o',
        'color: #b0b0b0;', // light gray
        changedFields,
        action
      );
      return { ...state, ...action } as SwapState;
    },
    swapStateFromParamsOrDefault(params, swapDefaultState)
  );

  // Load specific states via hooks
  const { mainTxState } = useModalContext();
  useEffect(() => {
    setState({ mainTxState });
  }, [mainTxState]);
  useUserContext({ setState });
  useMaxNativeAmount({ params, state, setState });
  useSlippageSelector({ params, state, setState });
  useFlowSelector({ params, state, setState });
  useSwapQuote({ params, state, setState });
  useProtocolReserves({ params, state, setState });
  const trackingHandlers = useHandleAnalytics({ state });

  console.debug('%c[Swap Modal Content] params', 'color: gray;', params);
  console.debug('%c[Swap Modal Content] state', 'color: gray;', state);

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
          setSwitchType={(orderType: OrderType) => {
            setState({ orderType });
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
