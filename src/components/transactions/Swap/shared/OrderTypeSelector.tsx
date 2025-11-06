import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';

import { OrderType } from '../types';

export function OrderTypeSelector({
  switchType,
  setSwitchType,
  limitsOrderButtonBlocked,
}: {
  switchType: OrderType;
  setSwitchType: (type: OrderType) => void;
  limitsOrderButtonBlocked: boolean;
}) {
  return (
    <Box sx={{ mb: 6 }}>
      <StyledTxModalToggleGroup
        color="primary"
        value={switchType}
        exclusive
        onChange={(_, value) => setSwitchType(value)}
      >
        <StyledTxModalToggleButton
          value={OrderType.MARKET}
          disabled={switchType === OrderType.MARKET}
        >
          <Typography variant="buttonM">
            <Trans>Market</Trans>
          </Typography>
        </StyledTxModalToggleButton>

        <StyledTxModalToggleButton
          value={OrderType.LIMIT}
          disabled={switchType === OrderType.LIMIT || limitsOrderButtonBlocked}
        >
          <Typography variant="buttonM">
            <Trans>Limit</Trans>
          </Typography>
        </StyledTxModalToggleButton>
      </StyledTxModalToggleGroup>
    </Box>
  );
}
