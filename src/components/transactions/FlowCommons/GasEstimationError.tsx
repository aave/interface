import { Trans } from '@lingui/macro';
import { Alert, Button, Typography } from '@mui/material';
import { TxErrorType } from 'src/ui-config/errorMapping';

export const GasEstimationError = ({ txError }: { txError: TxErrorType }) => {
  return (
    <Alert severity="error" sx={{ mt: 4 }}>
      <Typography variant="description">
        {txError.error ? (
          <>
            {txError.error}{' '}
            <Button
              variant="text"
              onClick={() => navigator.clipboard.writeText(txError.rawError.message.toString())}
            >
              <Typography variant="description">
                <Trans>copy the error</Trans>
              </Typography>
            </Button>
          </>
        ) : (
          <Trans>
            There was some error. Please try changing the parameters or{' '}
            <Button
              sx={{ verticalAlign: 'top' }}
              onClick={() => navigator.clipboard.writeText(txError.rawError.message.toString())}
            >
              <Typography variant="description">copy the error</Typography>
            </Button>
          </Trans>
        )}
      </Typography>
    </Alert>
  );
};
