import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { Dispatch, useEffect, useMemo } from 'react';
import { Warning } from 'src/components/primitives/Warning';

import { SwapState } from '../../types';
import { shouldRequireConfirmation, shouldShowWarning, valueLostPercentage } from '../helpers';

export function HighPriceImpactWarning({
  state,
  setState,
}: {
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) {
  const lostValue = useMemo(() => {
    if (!state.swapRate) return 0;
    return valueLostPercentage(
      Number(state.swapRate?.destUSD) * (1 - state.safeSlippage),
      Number(state.swapRate?.srcUSD)
    );
  }, [state.swapRate, state.safeSlippage]);

  const showWarning = useMemo(() => {
    if (!state.swapRate) return false;
    return shouldShowWarning(lostValue, Number(state.swapRate?.srcUSD));
  }, [state.swapRate, lostValue]);

  useEffect(() => {
    setState({ showHighPriceImpactWarning: showWarning });
  }, [showWarning]);

  const requireConfirmation = useMemo(() => {
    if (!state.swapRate) return false;
    return shouldRequireConfirmation(lostValue);
  }, [state.swapRate, lostValue]);

  useEffect(() => {
    setState({ requireConfirmation: requireConfirmation });
  }, [requireConfirmation]);

  if (!(state.showHighPriceImpactWarning && state.isSwapFlowSelected)) return null;

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
        <Trans>High price impact. This route may return less due to low liquidity.</Trans>
      </Typography>
      {state.requireConfirmation && (
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
              I confirm the swap with a potential {(lostValue * 100).toFixed(0)}% value loss
            </Trans>
          </Typography>
          <Checkbox
            checked={state.highPriceImpactConfirmed}
            onChange={() => {
              setState({ highPriceImpactConfirmed: !state.highPriceImpactConfirmed });
            }}
            size="small"
            data-cy={'high-price-impact-checkbox'}
          />
        </Box>
      )}
    </Warning>
  );
}
