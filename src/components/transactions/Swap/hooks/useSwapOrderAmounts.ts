import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { OrderKind } from '@cowprotocol/cow-sdk';
import { Dispatch, useEffect } from 'react';

import { COW_PARTNER_FEE } from '../constants/cow.constants';
import { OrderType, SwapParams, SwapState, SwapType } from '../types';
import { swapTypesThatRequiresInvertedQuote } from './useSwapQuote';

const marketOrderKindPerSwapType: Record<SwapType, OrderKind> = {
  [SwapType.Swap]: OrderKind.SELL,
  [SwapType.CollateralSwap]: OrderKind.SELL,
  [SwapType.DebtSwap]: OrderKind.BUY,
  [SwapType.RepayWithCollateral]: OrderKind.BUY,
  [SwapType.WithdrawAndSwap]: OrderKind.SELL,
};

/**
 * Computes normalized sell/buy amounts used to build transactions.
 *
 * Responsibilities:
 * - Applies partner fee and user slippage depending on order side and type
 * - Handles flows that require inverted quoting (DebtSwap, RepayWithCollateral)
 *   by swapping token roles: UI(source,destination) -> swap order request(sell,buy)
 * - Derives bigint amounts and USD values for details and execution
 * - Chooses the correct OrderKind for market orders per swap type
 */
export const useSwapOrderAmounts = ({
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) => {
  useEffect(() => {
    if (!state.swapRate?.afterFeesAmount) return;

    // On some swaps, the order is inverted, the required swap behind the operation is from our second input to our first.
    // e.g. repay with collateral, we have input Repay and output Available collateral, the required swap is from Available collateral to Repay.
    // So we need to invert the order of the tokens and the amounts.
    const isInvertedSwap = swapTypesThatRequiresInvertedQuote.includes(state.swapType);
    const processedSide = isInvertedSwap ? (state.side === 'sell' ? 'buy' : 'sell') : state.side;
    // The default order kind for market order is not always SELL, it depends on the swap type
    // e.g. for collateral swap, the default order kind is SELL, for debt swap, the default order kind is BUY
    const marketOrderKind = marketOrderKindPerSwapType[state.swapType];

    let buyAmountFormatted,
      sellAmountFormatted,
      buyAmountToken,
      sellAmountToken,
      buyTokenPriceUsd,
      sellTokenPriceUsd;
    const partnetFee = COW_PARTNER_FEE(state.sourceToken.symbol, state.destinationToken.symbol);
    const partnerFeeAmount =
      state.side === 'sell'
        ? valueToBigNumber(state.outputAmount).multipliedBy(partnetFee.volumeBps).dividedBy(10000)
        : valueToBigNumber(state.inputAmount).multipliedBy(partnetFee.volumeBps).dividedBy(10000);
    // const partnerFeeToken = state.side === 'sell' ? state.destinationToken : state.sourceToken;

    if (!isInvertedSwap) {
      // on classic swaps, minimum is calculated from the output token and sent amount is from the input token
      sellAmountToken = state.sourceToken;
      buyAmountToken = state.destinationToken;
      sellTokenPriceUsd = valueToBigNumber(state.inputAmountUSD)
        .dividedBy(valueToBigNumber(state.inputAmount))
        .toNumber();
      buyTokenPriceUsd = valueToBigNumber(state.outputAmountUSD)
        .dividedBy(valueToBigNumber(state.outputAmount))
        .toNumber();

      if (state.orderType === OrderType.MARKET) {
        // On a classic sell market order, we send the input amount and receive the amount after partner fees and slippage

        if (marketOrderKind === OrderKind.SELL) {
          sellAmountFormatted = state.inputAmount.toString();

          const outputAmountAfterPartnerFees = valueToBigNumber(state.outputAmount).minus(
            partnerFeeAmount
          );
          const outputAmountAfterSlippage = valueToBigNumber(
            outputAmountAfterPartnerFees
          ).multipliedBy(1 - Number(state.slippage) / 100);
          buyAmountFormatted = outputAmountAfterSlippage.toString();
        } else {
          buyAmountFormatted = state.inputAmount.toString();

          const sellAmountAfterPartnerFees = valueToBigNumber(state.outputAmount).plus(
            partnerFeeAmount
          );
          const sellAmountAfterSlippage = valueToBigNumber(sellAmountAfterPartnerFees).multipliedBy(
            1 + Number(state.slippage) / 100
          );
          sellAmountFormatted = sellAmountAfterSlippage.toString();
        }
      } else if (state.orderType === OrderType.LIMIT) {
        if (state.side === 'sell') {
          // on a sell limit order, we send the input amount and receive the amount after partner fees (no slippage applied)
          sellAmountFormatted = state.inputAmount.toString();
          buyAmountFormatted = valueToBigNumber(state.outputAmount)
            .minus(partnerFeeAmount)
            .toString();
        } else {
          // on a buy limit order, we receive exactly the output amount and send the input amount after partner fees (no slippage applied)
          sellAmountFormatted = state.inputAmount.toString();
          buyAmountFormatted = valueToBigNumber(state.outputAmount)
            .minus(partnerFeeAmount)
            .toString();
        }
      }
    } else {
      // if the swap is inverted (from the UI perspective, e.g. in a repay with collateral our second input is the sell token),
      // the minimum received is from the input token and sent is from the output token
      sellAmountToken = state.destinationToken;
      buyAmountToken = state.sourceToken;
      sellTokenPriceUsd = valueToBigNumber(state.outputAmountUSD)
        .dividedBy(valueToBigNumber(state.outputAmount))
        .toNumber();
      buyTokenPriceUsd = valueToBigNumber(state.inputAmountUSD)
        .dividedBy(valueToBigNumber(state.inputAmount))
        .toNumber();

      if (state.orderType === OrderType.MARKET) {
        // on a classic inverted sell market order, we send the output amount and receive the input amount after partner fees and slippage
        if (marketOrderKind === OrderKind.SELL) {
          sellAmountFormatted = state.outputAmount.toString();
          const inputAmountAfterPartnerFees = valueToBigNumber(state.inputAmount)
            .minus(partnerFeeAmount)
            .toString();
          const inputAmountAfterSlippage = valueToBigNumber(inputAmountAfterPartnerFees)
            .multipliedBy(1 + Number(state.slippage) / 100)
            .toString();
          buyAmountFormatted = inputAmountAfterSlippage;
        } else {
          buyAmountFormatted = state.inputAmount.toString();

          const sellAmountAfterPartnerFees = valueToBigNumber(state.inputAmount).plus(
            partnerFeeAmount
          );
          const sellAmountAfterSlippage = valueToBigNumber(sellAmountAfterPartnerFees).multipliedBy(
            1 + Number(state.slippage) / 100
          );
          sellAmountFormatted = sellAmountAfterSlippage.toString();
        }
      } else {
        if (state.side === 'sell') {
          // on an inverted sell limit order, we send the output amount and receive the input amount after partner fees (no slippage applied)
          sellAmountFormatted = state.outputAmount.toString();
          buyAmountFormatted = valueToBigNumber(state.inputAmount)
            .minus(partnerFeeAmount)
            .toString();
        } else {
          // on an inverted buy limit order, we receive exactly the input amount and send the output amount after partner fees (no slippage applied)
          buyAmountFormatted = state.outputAmount.toString();
          sellAmountFormatted = valueToBigNumber(state.inputAmount)
            .minus(partnerFeeAmount)
            .toString();
        }
      }
    }

    if (
      !buyAmountFormatted ||
      !sellAmountFormatted ||
      !sellAmountToken ||
      !buyAmountToken ||
      !sellTokenPriceUsd ||
      !buyTokenPriceUsd
    )
      return;

    const sellAmountUSD = valueToBigNumber(sellAmountFormatted)
      .multipliedBy(sellTokenPriceUsd)
      .toString();
    const buyAmountUSD = valueToBigNumber(buyAmountFormatted)
      .multipliedBy(buyTokenPriceUsd)
      .toString();

    const sellAmountBigInt = BigInt(
      normalizeBN(sellAmountFormatted, -sellAmountToken.decimals).toFixed(0)
    );
    const buyAmountBigInt = BigInt(
      normalizeBN(buyAmountFormatted, -buyAmountToken.decimals).toFixed(0)
    );

    setState({
      buyAmountFormatted,
      buyAmountUSD,
      sellAmountFormatted,
      sellAmountUSD,
      sellAmountToken,
      buyAmountToken,
      isInvertedSwap,
      sellAmountBigInt,
      buyAmountBigInt,
      processedSide,
    });
  }, [
    state.inputAmount,
    state.outputAmount,
    state.slippage,
    state.sourceToken,
    state.destinationToken,
    state.side,
    state.swapType,
    state.orderType,
  ]);
};
