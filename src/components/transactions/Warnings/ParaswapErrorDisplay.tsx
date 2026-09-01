import { Trans } from '@lingui/macro';
import { Alert, Box } from '@mui/material';
import { TxErrorType } from 'src/ui-config/errorMapping';

import { GasEstimationError } from '../FlowCommons/GasEstimationError';

const USER_DENIED_SIGNATURE = 'MetaMask Message Signature: User denied message signature.';
const USER_DENIED_TRANSACTION = 'MetaMask Tx Signature: User denied transaction signature.';

interface ErrorProps {
  txError: TxErrorType;
}
export const ParaswapErrorDisplay: React.FC<ErrorProps> = ({ txError }) => {
  return (
    <Box>
      <GasEstimationError txError={txError} />
      {txError.rawError.message !== USER_DENIED_SIGNATURE &&
        txError.rawError.message !== USER_DENIED_TRANSACTION && (
          <Box sx={{ pt: 4 }}>
            <Alert severity="info" sx={{ mb: 6, width: '100%' }}>
              <Trans> Tip: Try increasing slippage or reduce input amount</Trans>
            </Alert>
          </Box>
        )}
    </Box>
  );
};
