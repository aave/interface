import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { Dispatch, useEffect, useMemo, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';

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
    <Warning
      severity="warning"
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
          High price impact ({(lostValue * 100).toFixed(1)}%). This route may return{' '}
          {state.isInvertedSwap ? 'more' : 'less'} due to low liquidity or small order size.
        </Trans>
      </Typography>

      {requireConfirmation && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <Typography variant="caption">
            <Trans>
              I confirm the swap with a potential {(lostValue * 100).toFixed(0)}% value{' '}
              {state.isInvertedSwap ? 'increase' : 'loss'}
            </Trans>
          </Typography>
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
            data-cy={'high-price-impact-checkbox'}
          />
        </Box>
      )}
    </Warning>
  );
}
