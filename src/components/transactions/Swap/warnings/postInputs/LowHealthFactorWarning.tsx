import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { Dispatch, useEffect, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';

import { SwapParams, SwapState } from '../../types';
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
      setState({ actionsBlocked: true });
    } else {
      setState({ actionsBlocked: false });
    }
  }, [requireConfirmationHFlow, lowHFConfirmed, state.quoteLastUpdatedAt]);

  if (state.isLiquidatable || !requireConfirmationHFlow) {
    return null;
  }

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
          Low health factor after swap. Your position will carry a higher risk of liquidation.
        </Trans>
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          mt: 2,
        }}
      >
        <Typography variant="caption">
          <Trans>I understand the liquidation risk and want to proceed</Trans>
        </Typography>
        <Checkbox
          checked={lowHFConfirmed}
          onChange={() => {
            setLowHFConfirmed(!lowHFConfirmed);
          }}
          size="small"
          data-cy={'low-hf-checkbox'}
        />
      </Box>
    </Warning>
  );
}
