import { Trans } from '@lingui/macro';
import { Alert, Button, Typography } from '@mui/material';

export const GasEstimationError = ({ error }: { error: string }) => {
  return (
    <Alert severity="error">
      <Typography>
        <Trans>There was some</Trans>{' '}
        <Button variant="text" onClick={() => navigator.clipboard.writeText(error)}>
          error
        </Button>
        <Trans>. Please try changing the parameters.</Trans>
      </Typography>
    </Alert>
  );
};
