import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { TxErrorType } from 'src/ui-config/errorMapping';

export const GasEstimationError = ({ txError }: { txError: TxErrorType }) => {
  return (
    <Warning severity="error" sx={{ mt: 4, mb: 0 }}>
      <Typography variant="body2">
        {txError.error ? (
          <>
            {txError.error}{' '}
            <Button
              sx={{ verticalAlign: 'top' }}
              variant="text"
              onClick={() => navigator.clipboard.writeText(txError.rawError.message.toString())}
            >
              <Typography variant="body2">
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
              <Typography variant="body2">copy the error</Typography>
            </Button>
          </Trans>
        )}
      </Typography>
    </Warning>
  );
};
