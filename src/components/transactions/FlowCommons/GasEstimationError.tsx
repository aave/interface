import { Trans } from '@lingui/macro';
import { Alert, Button } from '@mui/material';
import { TxErrorType } from 'src/ui-config/errorMapping';

export const GasEstimationError = ({ txError }: { txError: TxErrorType }) => {
  const isUserRejection = !txError.blocking && !txError.actionBlocked;

  if (isUserRejection) {
    return (
      <Alert severity="info" sx={{ width: '100%', mt: 4, mb: 0 }}>
        {txError.error}
      </Alert>
    );
  }

  const errorText =
    txError.rawError instanceof Error
      ? txError.rawError.message
      : String(txError.rawError ?? 'Unknown error');

  return (
    <Alert severity="error" sx={{ width: '100%', mt: 4, mb: 0 }}>
      {txError.error ? (
        <>
          {txError.error}{' '}
          <Button variant="text" onClick={() => navigator.clipboard.writeText(errorText)}>
            <Trans>copy the error</Trans>
          </Button>
        </>
      ) : (
        <Trans>
          There was some error. Please try changing the parameters or{' '}
          <Button onClick={() => navigator.clipboard.writeText(errorText)}>copy the error</Button>
        </Trans>
      )}
    </Alert>
  );
};
