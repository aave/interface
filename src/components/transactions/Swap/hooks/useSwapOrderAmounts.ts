import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import { OrderKind } from '@cowprotocol/cow-sdk';
import { Dispatch, useEffect } from 'react';
import { useRootStore } from 'src/store/root';

import { COW_PARTNER_FEE } from '../constants/cow.constants';
import { PARASWAP_FLASH_LOAN_FEE_BPS } from '../constants/paraswap.constants';
import { isBackendRates, OrderType, SwapParams, SwapProvider, SwapState, SwapType } from '../types';
import { swapTypesThatRequiresInvertedQuote } from './useSwapQuote';

/** A backend cost as bps of the quote's sell leg; every backend cost is in the sell token. */
const backendFeeBps = (fee: string | undefined, sell: string) => {
  const base = valueToBigNumber(sell);
  return !fee || base.isZero()
    ? 0
    : valueToBigNumber(fee).dividedBy(base).multipliedBy(10000).toNumber();
};

const marketOrderKindPerSwapType: Record<SwapType, OrderKind> = {
  [SwapType.Swap]: OrderKind.SELL,
  [SwapType.CollateralSwap]: OrderKind.SELL,
  [SwapType.DebtSwap]: OrderKind.BUY,
  [SwapType.RepayWithCollateral]: OrderKind.BUY,
  [SwapType.WithdrawAndSwap]: OrderKind.SELL,
  // Backend leverage quotes override these amounts with their final legs.
  [SwapType.Leverage]: OrderKind.BUY,
};

const isPositionSwap = (swapType: SwapType, usingFlashloan: boolean) => {
  return swapType != SwapType.Swap && usingFlashloan;
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
  const currentMarket = useRootStore((state) => state.currentMarket);

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
    let partnetFeeBps =
      state.provider === SwapProvider.COW_PROTOCOL
        ? COW_PARTNER_FEE(
            state.sourceToken.symbol,
            state.destinationToken.symbol,
            state.swapType,
            currentMarket
          ).volumeBps
        : 0;
    let partnerFeeAmount =
      state.side === 'sell'
        ? valueToBigNumber(state.outputAmount).multipliedBy(partnetFeeBps).dividedBy(10000)
        : valueToBigNumber(state.inputAmount).multipliedBy(partnetFeeBps).dividedBy(10000);
    // const partnerFeeToken = state.side === 'sell' ? state.destinationToken : state.sourceToken;

    const backendQuote = isBackendRates(state.swapRate) ? state.swapRate.backendQuote : undefined;
    const usingFlashloan =
      !backendQuote && isPositionSwap(state.swapType, state.useFlashloan ?? false);
    const flashLoanFeeBps = usingFlashloan ? PARASWAP_FLASH_LOAN_FEE_BPS : 0;
    // Backend quotes price the flash loan themselves. Limit previews take its rate from the
    // reference quote, since the backend charges it again when it quotes the limit order.
    const flashLoanFeeRateBps = backendQuote
      ? backendFeeBps(backendQuote.costs.flashloanFee?.amount.value, backendQuote.sell.amount.value)
      : flashLoanFeeBps;
    let flashLoanFeeAmount =
      state.side == 'sell'
        ? valueToBigNumber(state.outputAmount).multipliedBy(flashLoanFeeRateBps).dividedBy(10000)
        : valueToBigNumber(state.inputAmount).multipliedBy(flashLoanFeeRateBps).dividedBy(10000);

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

      // ParaSwap quotes carry no network fee; backend market quotes override these below.
      const networkFeeAmountFormattedInSell = networkFeeAmountInSellFormatted;
      const networkFeeAmountFormattedInBuy = networkFeeAmountInBuyFormatted;

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
          const outputAmountAfterFlashLoanFees = valueToBigNumber(
            outputAmountAfterPartnerFees
          ).minus(flashLoanFeeAmount);
          const outputAmountAfterSlippage = valueToBigNumber(
            outputAmountAfterFlashLoanFees
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
          const sellAmountAfterFlashLoanFees = valueToBigNumber(sellAmountAfterPartnerFees).plus(
            flashLoanFeeAmount
          );
          const sellAmountAfterSlippage = valueToBigNumber(
            sellAmountAfterFlashLoanFees
          ).multipliedBy(1 + Number(state.slippage) / 100);
          sellAmountFormatted = sellAmountAfterSlippage.toFixed();
        }
      } else if (state.orderType === OrderType.LIMIT) {
        if (state.side === 'sell') {
          // on a sell limit order, we send the input amount and receive the amount after partner fees (no slippage applied)
          sellAmountFormatted = state.inputAmount;

          // Do not apply network costs on limit orders
          buyAmountFormatted = valueToBigNumber(state.outputAmount)
            .minus(partnerFeeAmount)
            .minus(flashLoanFeeAmount)
            .toFixed();
        } else {
          // on a buy limit order, we receive exactly the output amount and send the input amount after partner fees (no slippage applied)
          // Do not apply network costs on limit orders
          sellAmountFormatted = valueToBigNumber(state.inputAmount)
            .plus(partnerFeeAmount)
            .plus(flashLoanFeeAmount)
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

      const networkFeeAmountFormattedInSell = networkFeeAmountInSellFormatted;
      const networkFeeAmountFormattedInBuy = networkFeeAmountInBuyFormatted;

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
          const inputAmountAfterFlashLoanFees = valueToBigNumber(inputAmountAfterPartnerFees).minus(
            flashLoanFeeAmount
          );
          const inputAmountAfterSlippage = valueToBigNumber(inputAmountAfterFlashLoanFees)
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
          const sellAmountAfterFlashLoanFees = valueToBigNumber(sellAmountAfterPartnerFees).plus(
            flashLoanFeeAmount
          );
          const sellAmountAfterSlippage = valueToBigNumber(
            sellAmountAfterFlashLoanFees
          ).multipliedBy(1 + Number(state.slippage) / 100);
          sellAmountFormatted = sellAmountAfterSlippage.toFixed();
        }
      } else {
        if (processedSide === 'buy') {
          // on an inverted buy limit order, we buy the input amount and sell the output amount after partner fees (no slippage applied)
          buyAmountFormatted = state.inputAmount;

          // Do not apply network costs on limit orders
          sellAmountFormatted = valueToBigNumber(state.outputAmount)
            .plus(partnerFeeAmount)
            .plus(flashLoanFeeAmount)
            .toFixed();
        } else {
          // on an inverted sell limit order, we sell the output amount and buy the input amount after partner fees (no slippage applied)
          sellAmountFormatted = state.outputAmount;

          // Do not apply network costs on limit orders
          buyAmountFormatted = valueToBigNumber(state.inputAmount)
            .minus(partnerFeeAmount)
            .minus(flashLoanFeeAmount)
            .toFixed();
        }
      }
    }

    // The backend places the order with its own final amounts and costs, so show exactly those.
    if (isBackendRates(state.swapRate) && state.orderType === OrderType.MARKET) {
      const { finalSell, finalBuy, sell, buy, costs } = state.swapRate.backendQuote;
      sellAmountFormatted = finalSell.amount.value;
      buyAmountFormatted = finalBuy.amount.value;
      networkFeeAmountInSellFormatted = costs.networkCosts.amount.value;
      networkFeeAmountInBuyFormatted = valueToBigNumber(sell.amount.value).isZero()
        ? '0'
        : valueToBigNumber(costs.networkCosts.amount.value)
            .multipliedBy(buy.amount.value)
            .dividedBy(sell.amount.value)
            .toFixed();
      // Every backend cost is in the sell token.
      partnerFeeAmount = valueToBigNumber(costs.partnerFee.amount.value);
      flashLoanFeeAmount = valueToBigNumber(costs.flashloanFee?.amount.value ?? '0');
      partnetFeeBps = valueToBigNumber(
        backendFeeBps(costs.partnerFee.amount.value, sell.amount.value)
      )
        .decimalPlaces(2)
        .toNumber();
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
      flashLoanFeeAmountFormatted: flashLoanFeeAmount.toFixed(),
      flashLoanFeeBps,
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
    state.useFlashloan,
    state.swapRate,
  ]);
};
