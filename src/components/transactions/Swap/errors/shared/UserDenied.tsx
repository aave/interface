import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';

import { SwapError } from '../../types';

const USER_DENIED_SIGNATURE = 'User denied message signature.';
const USER_DENIED_TRANSACTION = 'User denied transaction signature.';

interface ErrorProps {
  txError?: SwapError;
  isLimitOrder?: boolean;
}

export const hasUserDenied = (txError: SwapError) => {
  return (
    txError.rawError.message.includes(USER_DENIED_SIGNATURE) ||
    txError.rawError.message.includes(USER_DENIED_TRANSACTION)
  );
};

export const UserDenied: React.FC<ErrorProps> = () => {
  //   If user denies return info message
  return (
    <Box>
      <Warning severity="info">
        <Typography variant="description">
          <Trans> User denied the operation.</Trans>
        </Typography>
      </Warning>
    </Box>
  );
};
