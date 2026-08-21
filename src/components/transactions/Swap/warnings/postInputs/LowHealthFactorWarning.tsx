import { Trans } from '@lingui/macro';
import { Alert, Box, Checkbox } from '@mui/material';
import { Dispatch, useEffect, useState } from 'react';

import { ActionsBlockedReason, SwapParams, SwapState } from '../../types';
import { shouldRequireConfirmationHFlow } from '../helpers';

export function LowHealthFactorWarning({
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) {
  const [lowHFConfirmed, setLowHFConfirmed] = useState<boolean>(false);
  const requireConfirmationHFlow = state.isHFLow
    ? shouldRequireConfirmationHFlow(Number(state.hfAfterSwap))
    : false;

  useEffect(() => {
    if (requireConfirmationHFlow && !lowHFConfirmed) {
      setState({
        actionsBlocked: {
          [ActionsBlockedReason.LOW_HEALTH_FACTOR]: true,
        },
      });
    } else {
      setState({
        actionsBlocked: {
          [ActionsBlockedReason.LOW_HEALTH_FACTOR]: undefined,
        },
      });
    }
  }, [requireConfirmationHFlow, lowHFConfirmed, state.quoteLastUpdatedAt]);

  if (state.isLiquidatable || !requireConfirmationHFlow) {
    return null;
  }

  return (
    <Alert severity="warning" data-size="small" sx={{ width: '100%', mt: 2, mb: 2 }}>
      <Trans>
        Low health factor after swap. Your position will carry a higher risk of liquidation.
      </Trans>
      {!state.actionsBlocked[ActionsBlockedReason.IS_LIQUIDATABLE] && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mt: '0.13rem',
          }}
        >
          <Trans>I understand the liquidation risk and want to proceed</Trans>
          <Checkbox
            checked={lowHFConfirmed}
            onChange={() => {
              setLowHFConfirmed(!lowHFConfirmed);
            }}
            size="small"
            sx={{ p: 0, ml: 2 }}
            data-cy={'low-hf-checkbox'}
          />
        </Box>
      )}
    </Alert>
  );
}
