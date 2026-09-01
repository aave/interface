import { Trans } from '@lingui/macro';
import { Alert, Box, Checkbox } from '@mui/material';
import { Dispatch, useEffect, useMemo, useState } from 'react';

import { SwapInputChanges } from '../../analytics/constants';
import { useHandleAnalytics } from '../../analytics/useTrackAnalytics';
import { ActionsBlockedReason, actionsBlockedReasonsAmount, SwapState } from '../../types';
import { shouldRequireConfirmation, shouldShowWarning, valueLostPercentage } from '../helpers';

export function HighPriceImpactWarning({
  state,
  setState,
}: {
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) {
  const trackingHandlers = useHandleAnalytics({ state });
  const lostValue = useMemo(() => {
    if (!state.swapRate) return 0;

    return valueLostPercentage(Number(state.buyAmountUSD), Number(state.sellAmountUSD));
  }, [state.buyAmountUSD, state.sellAmountUSD]);

  const showWarning = useMemo(() => {
    if (!state.swapRate) return false;
    return shouldShowWarning(lostValue, Number(state.sellAmountUSD));
  }, [state.swapRate, lostValue]);

  const requireConfirmation = useMemo(() => {
    if (!state.swapRate) return false;
    return shouldRequireConfirmation(lostValue);
  }, [state.swapRate, lostValue]);

  const [highPriceImpactConfirmed, setHighPriceImpactConfirmed] = useState(false);
  useEffect(() => {
    if (requireConfirmation && !highPriceImpactConfirmed) {
      setState({
        actionsBlocked: {
          [ActionsBlockedReason.HIGH_PRICE_IMPACT]: true,
        },
      });
    } else {
      setState({
        actionsBlocked: {
          [ActionsBlockedReason.HIGH_PRICE_IMPACT]: undefined,
        },
      });
    }
  }, [requireConfirmation, highPriceImpactConfirmed, state.quoteLastUpdatedAt]);

  if (!showWarning) return null;

  if (actionsBlockedReasonsAmount(state) > 1) return null;

  return (
    <Alert
      severity={lostValue > 0.3 ? 'error' : 'warning'}
      data-size="small"
      sx={{
        width: '100%',
        mt: 2,
        mb: 2,
      }}
    >
      <Trans>
        High price impact (<strong>{(lostValue * 100).toFixed(1)}%</strong>)! This route will return{' '}
        {state.isInvertedSwap ? 'more' : 'less'} due to low liquidity or small order size.
      </Trans>{' '}
      <Trans>Please review the swap values before confirming.</Trans>
      {requireConfirmation && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: '0.13rem',
          }}
        >
          <Trans>
            I confirm the swap knowing that I could lose up to{' '}
            <strong>{(lostValue * 100).toFixed(0)}%</strong> on this swap.
          </Trans>
          <Checkbox
            checked={highPriceImpactConfirmed}
            onChange={() => {
              const next = !highPriceImpactConfirmed;
              setHighPriceImpactConfirmed(next);
              trackingHandlers.trackInputChange(
                SwapInputChanges.HIGH_PRICE_IMPACT_CONFIRM,
                next ? 'confirmed' : 'unconfirmed'
              );
            }}
            size="small"
            sx={{ p: 0, ml: 2 }}
            data-cy={'high-price-impact-checkbox'}
          />
        </Box>
      )}
    </Alert>
  );
}
