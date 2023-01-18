import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { TxErrorType } from 'src/ui-config/errorMapping';

import { GasEstimationError } from '../FlowCommons/GasEstimationError';

const USER_DENIED_SIGNATURE = 'MetaMask Message Signature: User denied message signature.';
const USER_DENIED_TRANSACTION = 'MetaMask Message Signature: User denied message signature.';

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
            <Warning severity="info">
              <Typography variant="description">
                {' '}
                <Trans> Tip: Try increasing slippage or reduce input amount</Trans>
              </Typography>
            </Warning>
          </Box>
        )}
    </Box>
  );
};
