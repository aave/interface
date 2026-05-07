import { valueToBigNumber } from '@aave/math-utils';
import { SxProps } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { ethers } from 'ethers';
import { Dispatch, useEffect } from 'react';

import {
  ActionsBlockedReason,
  ProtocolSwapState,
  SwapError,
  SwapState,
  SwapType,
} from '../../types';
import { isProtocolSwapState } from '../../types/state.types';
import { InsufficientLiquidityBlockingError } from './InsufficientLiquidityBlockingError';

// The cow-swap-adapter flash-loans `_sellToken` for every position swap
// (CollateralSwap / DebtSwap / RepayWithCollateral, see
// cow-swap-adapters/src/adapters/v3/*Adapter.sol). The interface exposes that
// asset as `state.sellAmountToken`, so checking against it sidesteps the
// source/destination + isInvertedSwap question and mirrors what actually pulls
// from the lender on-chain.
export const hasInsufficientLiquidity = (state: SwapState) => {
  // isProtocolSwapState narrows out SwapType.Swap (direct DEX, no Aave call).
  if (!isProtocolSwapState(state)) return false;
  // Don't gate on `state.useFlashloan`: several protocol paths flash-loan
  // unconditionally regardless of the flag (CoW DebtSwap / RepayWithCollateral
  // via forceFlashloanFlow, ParaSwap DebtSwap via DebtSwitchAdapter, ParaSwap
  // CollateralSwap with `useFlashLoan: true` hardcoded). And even non-
  // flashloan paths still withdraw/borrow from the pool, which decrements
  // virtualUnderlyingBalance — the same liquidity ceiling we're guarding.
  if (!state.sellAmountToken || !state.sellAmountFormatted) return false;

  const flashLoanedAddress = state.sellAmountToken.underlyingAddress?.toLowerCase();
  if (!flashLoanedAddress) return false;

  const reserve = [state.sourceReserve?.reserve, state.destinationReserve?.reserve].find(
    (r) => r?.underlyingAsset?.toLowerCase() === flashLoanedAddress
  );
  if (!reserve) return false;

  const liquidity = BigNumber.max(valueToBigNumber(reserve.formattedAvailableLiquidity), 0);

  // Borrow cap only matters for DebtSwap, which leaves the user holding new
  // debt in the flash-loaned asset. Other flash-loan flows repay the loan
  // in-flight and never touch the borrow cap.
  const borrowCapRoom =
    state.swapType === SwapType.DebtSwap
      ? reserve.borrowCap === '0'
        ? valueToBigNumber(ethers.constants.MaxUint256.toString())
        : valueToBigNumber(reserve.borrowCap).minus(valueToBigNumber(reserve.totalDebt))
      : valueToBigNumber(ethers.constants.MaxUint256.toString());

  const effectiveLimit = BigNumber.max(BigNumber.min(liquidity, borrowCapRoom), 0);
  return valueToBigNumber(state.sellAmountFormatted).gt(effectiveLimit);
};

export const InsufficientLiquidityBlockingGuard = ({
  state,
  setState,
  sx,
  isSwapFlowSelected,
}: {
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  sx?: SxProps;
  isSwapFlowSelected: boolean;
}) => {
  useEffect(() => {
    const isBlocking = hasInsufficientLiquidity(state);

    if (isBlocking) {
      const isAlreadyBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'InsufficientLiquidityError';

      if (!isAlreadyBlockingError) {
        const blockingError: SwapError = {
          rawError: new Error('InsufficientLiquidityError'),
          message: 'Not enough liquidity in target asset to complete the swap.',
          actionBlocked: true,
        };
        setState({
          error: blockingError,
          actionsBlocked: {
            [ActionsBlockedReason.INSUFFICIENT_LIQUIDITY]: true,
          },
        });
      }
    } else {
      const isBlockingError =
        state.error?.rawError instanceof Error &&
        state.error.rawError.message === 'InsufficientLiquidityError';
      if (isBlockingError) {
        setState({
          error: undefined,
          actionsBlocked: {
            [ActionsBlockedReason.INSUFFICIENT_LIQUIDITY]: undefined,
          },
        });
      }
    }
  }, [
    state.swapType,
    state.sellAmountFormatted,
    state.sellAmountToken?.underlyingAddress,
    state.sourceReserve?.reserve?.formattedAvailableLiquidity,
    state.sourceReserve?.reserve?.borrowCap,
    state.sourceReserve?.reserve?.totalDebt,
    state.destinationReserve?.reserve?.formattedAvailableLiquidity,
    state.destinationReserve?.reserve?.borrowCap,
    state.destinationReserve?.reserve?.totalDebt,
  ]);

  if (hasInsufficientLiquidity(state)) {
    // hasInsufficientLiquidity ensures sellAmountToken is defined.
    const symbol = state.sellAmountToken?.symbol ?? '';
    return (
      <InsufficientLiquidityBlockingError
        symbol={symbol}
        sx={{ mb: !isSwapFlowSelected ? 0 : 4, ...sx }}
      />
    );
  }

  return null;
};
