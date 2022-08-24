import { Box, Typography } from '@mui/material';
import { Trans } from '@lingui/macro';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import StyledToggleButton from 'src/components/StyledToggleButton';

export enum RepayType {
  BALANCE,
  COLLATERAL,
}
export function RepayTypeSelector({
  repayType,
  setRepayType,
}: {
  repayType: RepayType;
  setRepayType: (type: RepayType) => void;
}) {
  const { currentMarketData } = useProtocolDataContext();
  if (!currentMarketData.enabledFeatures?.collateralRepay) return null;
  return (
    <Box sx={{ mb: 6 }}>
      <Typography mb={1} color="text.secondary">
        <Trans>Repay with</Trans>
      </Typography>

      <StyledToggleButtonGroup
        color="primary"
        value={repayType}
        exclusive
        onChange={(_, value) => setRepayType(value)}
        sx={{ width: '100%' }}
      >
        <StyledToggleButton value={RepayType.BALANCE} disabled={repayType === RepayType.BALANCE}>
          <Typography variant="subheader1" sx={{ mr: 1 }}>
            <Trans>Wallet balance</Trans>
          </Typography>
        </StyledToggleButton>

        <StyledToggleButton
          value={RepayType.COLLATERAL}
          disabled={repayType === RepayType.COLLATERAL}
        >
          <Typography variant="subheader1" sx={{ mr: 1 }}>
            <Trans>Collateral</Trans>
          </Typography>
        </StyledToggleButton>
      </StyledToggleButtonGroup>
    </Box>
  );
}
