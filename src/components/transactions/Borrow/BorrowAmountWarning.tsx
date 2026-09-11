import { Trans } from '@lingui/macro';
import { Alert, Box, Checkbox, Typography } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

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
      <Alert severity="error" sx={{ width: '100%', my: 6 }}>
        <Trans>
          Borrowing this amount will reduce your health factor and increase risk of liquidation.
        </Trans>
      </Alert>
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
