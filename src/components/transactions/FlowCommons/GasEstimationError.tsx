import { Trans } from '@lingui/macro';
import { Alert, Button, Typography } from '@mui/material';
import { TxErrorType } from 'src/ui-config/errorMapping';

export const GasEstimationError = ({ txError }: { txError: TxErrorType }) => {
  const isUserRejection = !txError.blocking && !txError.actionBlocked;

  if (isUserRejection) {
    return (
      <Alert severity="info" sx={{ width: '100%', mt: 4, mb: 0 }}>
        <Typography variant="description">{txError.error}</Typography>
      </Alert>
    );
  }

  const errorText =
    txError.rawError instanceof Error
      ? txError.rawError.message
      : String(txError.rawError ?? 'Unknown error');

  return (
    <Alert severity="error" sx={{ width: '100%', mt: 4, mb: 0 }}>
      <Typography variant="description">
        {txError.error ? (
          <>
            {txError.error}{' '}
            <Button
              sx={{ verticalAlign: 'top' }}
              variant="text"
              onClick={() => navigator.clipboard.writeText(errorText)}
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
              onClick={() => navigator.clipboard.writeText(errorText)}
            >
              <Typography variant="description">copy the error</Typography>
            </Button>
          </Trans>
        )}
      </Typography>
    </Alert>
  );
};
