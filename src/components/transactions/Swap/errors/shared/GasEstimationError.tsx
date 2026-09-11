import { Trans } from '@lingui/macro';
import { Alert, Box } from '@mui/material';
import { TxAction, TxErrorType } from 'src/ui-config/errorMapping';

import { GasEstimationError as GasEstimationErrorComponent } from '../../../FlowCommons/GasEstimationError';

interface ErrorProps {
  error?: Error;
  isLimitOrder?: boolean;
}

export const GasEstimationError: React.FC<ErrorProps> = ({ error, isLimitOrder }) => {
  if (!error) {
    return null;
  }

  const txErrorType: TxErrorType = {
    blocking: false,
    actionBlocked: false,
    rawError: error,
    error: <Trans>Gas estimation error</Trans>,
    txAction: TxAction.GAS_ESTIMATION,
  };

  return (
    <Box>
      <GasEstimationErrorComponent txError={txErrorType} />
      <Box sx={{ pt: 4 }}>
        <Alert severity="info" sx={{ mb: 6, width: '100%' }}>
          {' '}
          {isLimitOrder ? (
            <Trans> Tip: Try increasing slippage or reduce input amount</Trans>
          ) : (
            <Trans> Tip: Try improving your order parameters</Trans>
          )}
        </Alert>
      </Box>
    </Box>
  );
};
