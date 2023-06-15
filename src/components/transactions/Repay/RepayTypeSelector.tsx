import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';
import { REPAY_MODAL } from 'src/utils/mixPanelEvents';

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
  const trackEvent = useRootStore((store) => store.trackEvent);

  if (!currentMarketData.enabledFeatures?.collateralRepay) return null;
  return (
    <Box sx={{ mb: 6 }}>
      <Typography mb={1} color="text.secondary">
        <Trans>Repay with</Trans>
      </Typography>

      <StyledTxModalToggleGroup
        color="primary"
        value={repayType}
        exclusive
        onChange={(_, value) => setRepayType(value)}
      >
        <StyledTxModalToggleButton
          value={RepayType.BALANCE}
          disabled={repayType === RepayType.BALANCE}
          onClick={() => trackEvent(REPAY_MODAL.SWITCH_REPAY_TYPE, { repayType: 'Wallet Balance' })}
        >
          <Typography variant="buttonM">
            <Trans>Wallet balance</Trans>
          </Typography>
        </StyledTxModalToggleButton>

        <StyledTxModalToggleButton
          value={RepayType.COLLATERAL}
          disabled={repayType === RepayType.COLLATERAL}
          onClick={() => trackEvent(REPAY_MODAL.SWITCH_REPAY_TYPE, { repayType: 'Collateral' })}
        >
          <Typography variant="buttonM">
            <Trans>Collateral</Trans>
          </Typography>
        </StyledTxModalToggleButton>
      </StyledTxModalToggleGroup>
    </Box>
  );
}
