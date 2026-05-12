import { normalize } from '@aave/math-utils';
import { parseUnits } from 'ethers/lib/utils';
import { Dispatch, useEffect } from 'react';

import { SwapParams, SwapState, SwapType, TokenType } from '../types';

/**
 * Computes the max selectable amount for native-asset sells, leaving gas headroom.
 * Applies only to simple token swaps for EOAs; SCWs/Safe and protocol flows ignore it.
 */
export const useMaxNativeAmount = ({
  params,
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  // Eth-Flow requires to leave some assets for gas
  const nativeDecimals = 18;
  const gasRequiredForEthFlow =
    state.chainId === 1 ? parseUnits('0.01', nativeDecimals) : parseUnits('0.0001', nativeDecimals); // TODO: Ask for better value coming from the SDK

  const requiredAssetsLeftForGas =
    state.sourceToken.tokenType === TokenType.NATIVE &&
    !state.userIsSmartContractWallet &&
    params.swapType === SwapType.Swap
      ? gasRequiredForEthFlow
      : undefined;

  const maxAmount = (() => {
    const balance = parseUnits(state.sourceToken.balance, nativeDecimals);
    if (!requiredAssetsLeftForGas) return balance;
    return balance.gt(requiredAssetsLeftForGas) ? balance.sub(requiredAssetsLeftForGas) : balance;
  })();

  const maxAmountFormatted = maxAmount
    ? normalize(maxAmount.toString(), nativeDecimals).toString()
    : undefined;

  // Only force a max value for native sells (where we need to reserve gas). For
  // other tokens, leave forcedMaxValue undefined so the Max button routes through
  // handleInputChange's '-1' path and the aToken 1-wei shave applies.
  const isNative = state.sourceToken.tokenType === TokenType.NATIVE;
  useEffect(() => {
    setState({ forcedMaxValue: isNative ? maxAmountFormatted : undefined });
  }, [maxAmountFormatted, isNative]);
};
