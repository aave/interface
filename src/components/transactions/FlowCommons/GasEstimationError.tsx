import { Trans } from '@lingui/macro';
import { Alert, Button, Typography } from '@mui/material';
import { TxErrorType } from 'src/ui-config/errorMapping';

export const GasEstimationError = ({ txError }: { txError: TxErrorType }) => {
  return (
    <Alert severity="error" sx={{ mt: 4 }}>
      <Typography>
        {txError.error ? (
          txError.error
        ) : (
          <Trans>
            There was some{' '}
            <Button
              variant="text"
              onClick={() => navigator.clipboard.writeText(txError.rawError.message.toString())}
            >
              error
            </Button>
            . Please try changing the parameters.
          </Trans>
        )}
      </Typography>
    </Alert>
  );
};
