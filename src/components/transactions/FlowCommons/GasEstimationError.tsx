import { Trans } from '@lingui/macro';
import { Alert, Button, Typography } from '@mui/material';
import { TxErrorType } from 'src/ui-config/errorMapping';

export const GasEstimationError = ({ txError }: { txError: TxErrorType }) => {
  return (
    <Alert severity="error" sx={{ mt: 4 }}>
      <Typography>
        {txError.error ? (
          <>
            {txError.error}{' '}
            <Button
              variant="text"
              onClick={() => navigator.clipboard.writeText(txError.rawError.message.toString())}
            >
              <Trans>Copy error</Trans>
            </Button>
          </>
        ) : (
          <Trans>
            There was some error. Please try changing the parameters or
            <Button
              variant="text"
              onClick={() => navigator.clipboard.writeText(txError.rawError.message.toString())}
            >
              copy the error
            </Button>
          </Trans>
        )}
      </Typography>
    </Alert>
  );
};
