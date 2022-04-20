import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Trans } from '@lingui/macro';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

export enum RepayType {
  BALANCE,
  COLLATERAL,
}

// set false to enable switch on ui
const UNFINISHED = false;

export function RepayTypeSelector({
  repayType,
  setRepayType,
}: {
  repayType: RepayType;
  setRepayType: (type: RepayType) => void;
}) {
  const { currentMarketData } = useProtocolDataContext();
  if (UNFINISHED || !currentMarketData.enabledFeatures?.collateralRepay) return null;
  return (
    <Box sx={{ mb: 6 }}>
      <Typography mb={1} color="text.secondary">
        <Trans>Repay with</Trans>
      </Typography>

      <ToggleButtonGroup
        color="primary"
        value={repayType}
        exclusive
        onChange={(_, value) => setRepayType(value)}
        sx={{ width: '100%' }}
      >
        <ToggleButton value={RepayType.BALANCE} disabled={repayType === RepayType.BALANCE}>
          <Typography variant="subheader1" sx={{ mr: 1 }}>
            <Trans>Wallet balance</Trans>
          </Typography>
        </ToggleButton>

        <ToggleButton value={RepayType.COLLATERAL} disabled={repayType === RepayType.COLLATERAL}>
          <Typography variant="subheader1" sx={{ mr: 1 }}>
            <Trans>Collateral</Trans>
          </Typography>
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
