import { Trans } from '@lingui/macro';
import { Alert, Button, Typography } from '@mui/material';

export const GasEstimationError = ({ error }: { error: string }) => {
  return (
    <Alert severity="error" sx={{ mt: 4 }}>
      <Typography>
        <Trans>
          There was some{' '}
          <Button variant="text" onClick={() => navigator.clipboard.writeText(error)}>
            error
          </Button>
          . Please try changing the parameters.
        </Trans>
      </Typography>
    </Alert>
  );
};
