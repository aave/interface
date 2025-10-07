import { normalize, valueToBigNumber } from '@aave/math-utils';
import { Dispatch, useEffect } from 'react';
import { minimumReceivedAfterSlippage } from 'src/hooks/paraswap/common';

import { OrderType, SwapParams, SwapState } from '../types';

export const useMinimumReceived = ({
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  useEffect(() => {
    if (!state.swapRate?.afterFeesAmount) return;

    let minimumReceived;
    if (state.orderType === OrderType.MARKET) {
      minimumReceived = normalize(
        minimumReceivedAfterSlippage(state.swapRate?.afterFeesAmount, state.slippage, 0),
        state.destinationToken.decimals
      );
    } else if (state.orderType === OrderType.LIMIT) {
      minimumReceived = state.outputAmount; // TODO: check if with cow we need to account partner fees
    }

    if (!minimumReceived) return;
    const outputTokenPriceUsd = valueToBigNumber(state.outputAmountUSD)
      .dividedBy(valueToBigNumber(state.outputAmount))
      .toNumber();
    const minimumReceivedUSD = valueToBigNumber(minimumReceived)
      .multipliedBy(outputTokenPriceUsd)
      .toString();

    setState({ minimumReceived, minimumReceivedUSD });
  }, [
    state.swapRate?.afterFeesAmount,
    state.outputAmount,
    state.slippage,
    state.destinationToken.decimals,
    state.orderType,
  ]);
};
