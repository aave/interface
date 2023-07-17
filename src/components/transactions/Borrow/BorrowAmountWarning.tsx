import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

interface BorrowAmountWarningProps {
  riskCheckboxAccepted: boolean;
  onRiskCheckboxChange: () => void;
}

export const BorrowAmountWarning = ({
  riskCheckboxAccepted,
  onRiskCheckboxChange,
}: BorrowAmountWarningProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <>
      <Warning severity="error" sx={{ my: 6 }}>
        <Trans>
          Borrowing this amount will reduce your health factor and increase risk of liquidation.
        </Trans>
      </Warning>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          mx: '24px',
          mb: '12px',
        }}
      >
        <Checkbox
          checked={riskCheckboxAccepted}
          onChange={(event) => {
            trackEvent(GENERAL.ACCEPT_RISK, {
              modal: 'Borrow',
              riskCheckboxAccepted: event.target.checked,
            });

            onRiskCheckboxChange();
          }}
          size="small"
          data-cy={'risk-checkbox'}
        />
        <Typography variant="description">
          <Trans>I acknowledge the risks involved.</Trans>
        </Typography>
      </Box>
    </>
  );
};
