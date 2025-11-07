import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useMemo } from 'react';
import { Warning } from 'src/components/primitives/Warning';

import { SwapState } from '../../types';
import { OrderType } from '../../types/shared.types';

export function LimitOrderAmountWarning({ state }: { state: SwapState }) {
  const suggestedSlippage = state.swapRate?.suggestedSlippage;

  const [shouldShowWarning, isHigherDifference, differencePercentage] = useMemo(() => {
    if (state.orderType !== OrderType.LIMIT || !state.swapRate || suggestedSlippage == null) {
      return [false, false];
    }

    // Derive token USD unit prices from current quote (spot)
    const sellAmountUSD = valueToBigNumber(state.sellAmountUSD || '0');
    const buyAmountUSD = valueToBigNumber(state.buyAmountUSD || '0');

    // User-defined amounts converted to USD using spot unit prices
    const userInputUsd = sellAmountUSD;
    const userOutputUsd = buyAmountUSD;

    if (userInputUsd.isZero() || userOutputUsd.isZero()) {
      return [false, false];
    }

    // Compute gains vs input in percentage terms
    const userGainPct = userOutputUsd.minus(userInputUsd).dividedBy(userInputUsd).multipliedBy(100);

    if (userGainPct.isLessThan(0)) {
      return [false, false];
    }

    // Apply provider suggested slippage to output side to get a conservative reference
    const slippageFactor = valueToBigNumber(1).minus(
      valueToBigNumber(suggestedSlippage).dividedBy(100)
    );
    const recommendedInputUsd = valueToBigNumber(state.swapRate.srcSpotUSD || '0');
    const recommendedMinOutputUsd = valueToBigNumber(
      state.swapRate.destSpotUSD || '0'
    ).multipliedBy(slippageFactor);
    const recommendedGainPct = recommendedMinOutputUsd
      .minus(recommendedInputUsd)
      .dividedBy(recommendedInputUsd)
      .multipliedBy(100);

    // Positive difference means user is worse than recommended reference
    const diffPct = recommendedGainPct.minus(userGainPct);

    const shouldShow = diffPct.isLessThan(-5); // user's order less favorable than recommended
    const significant = diffPct.isLessThan(-10); // >= 10% worse considered significant

    return [shouldShow, significant, diffPct];
  }, [
    state.orderType,
    state.swapRate?.srcTokenPriceUsd,
    state.swapRate?.destTokenPriceUsd,
    state.sellAmountUSD,
    state.buyAmountUSD,
    suggestedSlippage,
  ]);

  if (!shouldShowWarning) return null;

  return (
    <Warning
      severity={isHigherDifference ? 'warning' : 'info'}
      icon={false}
      sx={{
        mt: 2,
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Typography variant="caption">
        <Trans>
          Your order amounts are {isHigherDifference ? 'significantly ' : ''} less favorable by{' '}
          {differencePercentage?.abs()?.toFixed(1) ?? '0'}% to the liquidity provider than
          recommended. This order may not be executed.
        </Trans>
      </Typography>
    </Warning>
  );
}
