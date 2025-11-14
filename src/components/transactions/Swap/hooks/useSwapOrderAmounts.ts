import { normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { OrderKind } from '@cowprotocol/cow-sdk';
import { Dispatch, useEffect } from 'react';

import { COW_PARTNER_FEE } from '../constants/cow.constants';
import {
  isCowProtocolRates,
  OrderType,
  SwapParams,
  SwapProvider,
  SwapState,
  SwapType,
} from '../types';
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
    if (
      !state.swapRate?.afterFeesAmount ||
      state.outputAmount == '' ||
      state.outputAmount == 'NaN' ||
      state.inputAmount == '' ||
      state.inputAmount == 'NaN' ||
      (state.orderType === OrderType.MARKET && state.slippage == undefined)
    )
      return;

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
    // Track costs to expose them in state (unified across details views)
    let networkFeeAmountInSellFormatted = '0';
    let networkFeeAmountInBuyFormatted = '0';
    const partnetFeeBps =
      state.provider === SwapProvider.COW_PROTOCOL
        ? COW_PARTNER_FEE(state.sourceToken.symbol, state.destinationToken.symbol).volumeBps
        : 0;
    const partnerFeeAmount =
      state.side === 'sell'
        ? valueToBigNumber(state.outputAmount).multipliedBy(partnetFeeBps).dividedBy(10000)
        : valueToBigNumber(state.inputAmount).multipliedBy(partnetFeeBps).dividedBy(10000);
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

      let networkFeeAmountFormattedInSell = isCowProtocolRates(state.swapRate)
        ? normalize(
            state.swapRate.amountAndCosts.costs.networkFee.amountInSellCurrency.toString(),
            sellAmountToken.decimals
          )
        : '0';
      let networkFeeAmountFormattedInBuy = isCowProtocolRates(state.swapRate)
        ? normalize(
            state.swapRate.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString(),
            buyAmountToken.decimals
          )
        : '0';

      // Trick waiting for CoW solvers precise hook simulation - TODO: remove once it's solved on CoW's BFF
      if (
        state.swapType === SwapType.RepayWithCollateral ||
        state.swapType === SwapType.DebtSwap ||
        state.swapType === SwapType.CollateralSwap
      ) {
        networkFeeAmountFormattedInSell = valueToBigNumber(networkFeeAmountFormattedInSell)
          .multipliedBy(3)
          .toFixed();
        networkFeeAmountFormattedInBuy = valueToBigNumber(networkFeeAmountFormattedInBuy)
          .multipliedBy(3)
          .toFixed();
      }
      networkFeeAmountInSellFormatted = networkFeeAmountFormattedInSell;
      networkFeeAmountInBuyFormatted = networkFeeAmountFormattedInBuy;

      if (state.orderType === OrderType.MARKET) {
        // On a classic sell market order, we send the input amount and receive the amount after partner fees and slippage

        if (marketOrderKind === OrderKind.SELL) {
          sellAmountFormatted = state.inputAmount;

          const outputAmountAfterNetworkFees = valueToBigNumber(state.outputAmount).minus(
            networkFeeAmountFormattedInBuy
          );
          const outputAmountAfterPartnerFees = valueToBigNumber(outputAmountAfterNetworkFees).minus(
            partnerFeeAmount
          );
          const outputAmountAfterSlippage = valueToBigNumber(
            outputAmountAfterPartnerFees
          ).multipliedBy(1 - Number(state.slippage) / 100);
          buyAmountFormatted = outputAmountAfterSlippage.toFixed();
        } else {
          // TODO: check if this is correct
          buyAmountFormatted = state.inputAmount;

          const sellAmountAfterNetworkFees = valueToBigNumber(state.outputAmount).plus(
            networkFeeAmountFormattedInSell
          );
          const sellAmountAfterPartnerFees = valueToBigNumber(sellAmountAfterNetworkFees).plus(
            partnerFeeAmount
          );
          const sellAmountAfterSlippage = valueToBigNumber(sellAmountAfterPartnerFees).multipliedBy(
            1 + Number(state.slippage) / 100
          );
          sellAmountFormatted = sellAmountAfterSlippage.toFixed();
        }
      } else if (state.orderType === OrderType.LIMIT) {
        if (state.side === 'sell') {
          // on a sell limit order, we send the input amount and receive the amount after partner fees (no slippage applied)
          sellAmountFormatted = state.inputAmount;

          // Do not apply network costs on limit orders
          buyAmountFormatted = valueToBigNumber(state.outputAmount)
            .minus(partnerFeeAmount)
            .toFixed();
        } else {
          // on a buy limit order, we receive exactly the output amount and send the input amount after partner fees (no slippage applied)
          // Do not apply network costs on limit orders
          sellAmountFormatted = valueToBigNumber(state.inputAmount)
            .plus(partnerFeeAmount)
            .toFixed();

          buyAmountFormatted = state.outputAmount;
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

      let networkFeeAmountFormattedInSell = isCowProtocolRates(state.swapRate)
        ? normalize(
            state.swapRate.amountAndCosts.costs.networkFee.amountInSellCurrency.toString(),
            sellAmountToken.decimals
          )
        : '0';
      let networkFeeAmountFormattedInBuy = isCowProtocolRates(state.swapRate)
        ? normalize(
            state.swapRate.amountAndCosts.costs.networkFee.amountInBuyCurrency.toString(),
            buyAmountToken.decimals
          )
        : '0';

      // console.debug('networkFeeAmountFormattedInSell', networkFeeAmountFormattedInSell);
      // console.debug('networkFeeAmountFormattedInBuy', networkFeeAmountFormattedInBuy);

      // Trick waiting for CoW solvers precise hook simulation - TODO: remove once it's solved on CoW's BFF
      if (
        state.swapType === SwapType.RepayWithCollateral ||
        state.swapType === SwapType.DebtSwap ||
        state.swapType === SwapType.CollateralSwap
      ) {
        networkFeeAmountFormattedInSell = valueToBigNumber(networkFeeAmountFormattedInSell)
          .multipliedBy(3)
          .toFixed();
        networkFeeAmountFormattedInBuy = valueToBigNumber(networkFeeAmountFormattedInBuy)
          .multipliedBy(3)
          .toFixed();
      }

      // console.debug('networkFeeAmountFormattedInSell after trick', networkFeeAmountFormattedInSell);
      // console.debug('networkFeeAmountFormattedInBuy after trick', networkFeeAmountFormattedInBuy);
      networkFeeAmountInSellFormatted = networkFeeAmountFormattedInSell;
      networkFeeAmountInBuyFormatted = networkFeeAmountFormattedInBuy;

      if (state.orderType === OrderType.MARKET) {
        // on a classic inverted sell market order, we send the output amount and receive the input amount after partner fees and slippage
        if (marketOrderKind === OrderKind.SELL) {
          sellAmountFormatted = state.outputAmount;

          const inputAmountAfterNetworkFees = valueToBigNumber(state.inputAmount).minus(
            networkFeeAmountFormattedInBuy
          );
          const inputAmountAfterPartnerFees = valueToBigNumber(inputAmountAfterNetworkFees)
            .minus(partnerFeeAmount)
            .toFixed();
          const inputAmountAfterSlippage = valueToBigNumber(inputAmountAfterPartnerFees)
            .multipliedBy(1 + Number(state.slippage) / 100)
            .toFixed();
          buyAmountFormatted = inputAmountAfterSlippage;
        } else {
          buyAmountFormatted = state.inputAmount;

          const sellAmountAfterNetworkFees = valueToBigNumber(state.outputAmount).plus(
            networkFeeAmountFormattedInSell
          );
          const sellAmountAfterPartnerFees = valueToBigNumber(sellAmountAfterNetworkFees).plus(
            partnerFeeAmount
          );
          const sellAmountAfterSlippage = valueToBigNumber(sellAmountAfterPartnerFees).multipliedBy(
            1 + Number(state.slippage) / 100
          );
          sellAmountFormatted = sellAmountAfterSlippage.toFixed();
        }
      } else {
        if (processedSide === 'buy') {
          // on an inverted buy limit order, we buy the input amount and sell the output amount after partner fees (no slippage applied)
          buyAmountFormatted = state.inputAmount;

          // Do not apply network costs on limit orders
          sellAmountFormatted = valueToBigNumber(state.outputAmount)
            .plus(partnerFeeAmount)
            .toFixed();
        } else {
          // on an inverted sell limit order, we sell the output amount and buy the input amount after partner fees (no slippage applied)
          sellAmountFormatted = state.outputAmount;

          // Do not apply network costs on limit orders
          buyAmountFormatted = valueToBigNumber(state.inputAmount)
            .minus(partnerFeeAmount)
            .toFixed();
        }
      }
    }

    if (
      buyAmountFormatted == undefined ||
      sellAmountFormatted == undefined ||
      sellAmountToken == undefined ||
      buyAmountToken == undefined ||
      sellTokenPriceUsd == undefined ||
      buyTokenPriceUsd == undefined
    )
      return;

    // Avoid negative amounts
    sellAmountFormatted = valueToBigNumber(sellAmountFormatted ?? '0').lt(0)
      ? '0'
      : sellAmountFormatted;
    buyAmountFormatted = valueToBigNumber(buyAmountFormatted ?? '0').lt(0)
      ? '0'
      : buyAmountFormatted;

    const sellAmountUSD = valueToBigNumber(sellAmountFormatted)
      .multipliedBy(sellTokenPriceUsd)
      .toFixed();
    const buyAmountUSD = valueToBigNumber(buyAmountFormatted)
      .multipliedBy(buyTokenPriceUsd)
      .toFixed();

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
      networkFeeAmountInSellFormatted,
      networkFeeAmountInBuyFormatted,
      partnerFeeAmountFormatted: partnerFeeAmount.toFixed(),
      partnerFeeBps: partnetFeeBps,
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
