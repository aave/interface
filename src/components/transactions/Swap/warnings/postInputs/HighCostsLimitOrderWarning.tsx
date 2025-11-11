import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { Warning } from 'src/components/primitives/Warning';

import { OrderType, SwapState } from '../../types';

/**
 * Shows a warning on LIMIT orders when total costs exceed 30% of the sell amount.
 * Additionally, disables actions across ALL swap types if total costs exceed 100%.
 *
 * "Total costs" = network fee + partner fee (+ flashloan fee for protocol flows) in USD.
 */
export function HighCostsLimitOrderWarning({
  state,
  setState,
}: {
  state: SwapState;
  setState: (s: Partial<SwapState>) => void;
}) {
  const { costsPercentOfSell } = useMemo(() => {
    if (!state.sellAmountFormatted || !state.sellAmountUSD) {
      return { costsPercentOfSell: 0 };
    }

    // Price per unit in USD derived from useSwapOrderAmounts state
    const sellAmount = valueToBigNumber(state.sellAmountFormatted || '0');
    const sellAmountUsd = valueToBigNumber(state.sellAmountUSD || '0');
    const buyAmount = valueToBigNumber(state.buyAmountFormatted || '0');
    const buyAmountUsd = valueToBigNumber(state.buyAmountUSD || '0');
    const sellPriceUnitUsd = sellAmount.isZero()
      ? 0
      : sellAmountUsd.dividedBy(sellAmount).toNumber();
    const buyPriceUnitUsd = buyAmount.isZero() ? 0 : buyAmountUsd.dividedBy(buyAmount).toNumber();

    // Network fee in sell token units -> USD
    const networkFeeFormatted = state.networkFeeAmountInSellFormatted || '0';
    const networkFeeUsd = Number(networkFeeFormatted) * sellPriceUnitUsd;

    // Partner fee in "surplus" token; convert to USD using contextual unit price
    const invertedSide = state.processedSide;
    const partnerFeeFormatted = state.partnerFeeAmountFormatted || '0';
    let partnerFeeUsd = 0;
    if (invertedSide === 'buy') {
      // Fee in destination/buy token -> use sell leg price per unit
      partnerFeeUsd = Number(partnerFeeFormatted) * sellPriceUnitUsd;
    } else {
      // Fee in source/sell token -> use buy leg price per unit
      partnerFeeUsd = Number(partnerFeeFormatted) * buyPriceUnitUsd;
    }

    const totalCostsUsd = (networkFeeUsd || 0) + (partnerFeeUsd || 0);
    const costsPercentOfSell = sellAmountUsd.gt(0)
      ? (totalCostsUsd / Number(sellAmountUsd.toString())) * 100
      : 0;

    return { costsPercentOfSell };
  }, [
    state.networkFeeAmountInSellFormatted,
    state.sellAmountFormatted,
    state.sellAmountUSD,
    state.buyAmountFormatted,
    state.buyAmountUSD,
    state.partnerFeeAmountFormatted,
    state.processedSide,
  ]);

  // Disable actions across ALL swap types when costs exceed 100%
  useEffect(() => {
    if (costsPercentOfSell >= 100) {
      setState({ actionsBlocked: true });
    } else {
      setState({ actionsBlocked: false });
    }
    // Include quote timestamp to recompute when refreshed
  }, [costsPercentOfSell, state.quoteLastUpdatedAt]);

  // Show warning for LIMIT orders when > 30% and for MARKET orders when >= 100%
  if (
    (costsPercentOfSell <= 30 && state.orderType === OrderType.LIMIT) ||
    (costsPercentOfSell < 100 && state.orderType === OrderType.MARKET)
  )
    return null;

  return (
    <Warning severity="warning" icon={false} sx={{ mt: 2 }}>
      <Typography variant="caption">
        <Trans>
          Estimated costs are {costsPercentOfSell.toFixed(2)}% of the sell amount. This limit order
          is unlikely to be filled.
        </Trans>
      </Typography>
    </Warning>
  );
}
