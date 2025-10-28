import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { Dispatch, useEffect, useMemo, useState } from 'react';
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
      setState({ actionsBlocked: true });
    } else {
      setState({ actionsBlocked: false });
    }
  }, [requireConfirmation, highPriceImpactConfirmed]);

  if (!showWarning) return null;

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
          High price impact. This route may return less due to low liquidity or small order size.
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
              I confirm the swap with a potential {(lostValue * 100).toFixed(0)}% value loss
            </Trans>
          </Typography>
          <Checkbox
            checked={highPriceImpactConfirmed}
            onChange={() => {
              setHighPriceImpactConfirmed(!highPriceImpactConfirmed);
            }}
            size="small"
            data-cy={'high-price-impact-checkbox'}
          />
        </Box>
      )}
    </Warning>
  );
}
