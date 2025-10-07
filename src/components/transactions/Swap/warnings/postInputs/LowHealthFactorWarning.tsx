import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { Dispatch, useEffect } from 'react';
import { Warning } from 'src/components/primitives/Warning';

import { SwapParams, SwapState, SwapType } from '../../types';
import { shouldRequireConfirmationHFlow } from '../helpers';

export function LowHealthFactorWarning({
  params,
  state,
  setState,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
}) {
  const requireConfirmationHFlow = state.isHFLow
    ? shouldRequireConfirmationHFlow(Number(state.hfAfterSwap))
    : false;
  useEffect(() => {
    setState({ requireConfirmationHFlow: requireConfirmationHFlow });
  }, [requireConfirmationHFlow]);

  if (!(params.swapType === SwapType.CollateralSwap && state.isHFLow && !state.isLiquidatable))
    return null;

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
          checked={state.lowHFConfirmed}
          onChange={() => {
            setState({ lowHFConfirmed: !state.lowHFConfirmed });
          }}
          size="small"
          data-cy={'low-hf-checkbox'}
        />
      </Box>
    </Warning>
  );
}
