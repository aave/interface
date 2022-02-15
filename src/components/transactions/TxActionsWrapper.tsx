import { Trans } from '@lingui/macro';
import { Box, BoxProps, Button } from '@mui/material';
import { ReactNode } from 'react';

import { TxStateType } from '../../helpers/useTransactionHandler';

interface TxActionsWrapperProps extends BoxProps {
  mainTxState: TxStateType;
  approvalTxState?: TxStateType;
  helperText?: ReactNode;
  withAmount?: boolean;
  hasAmount?: boolean | string;
  handleRetry?: () => void;
  handleClose: () => void;
  children: ReactNode;
}

export const TxActionsWrapper = ({
  mainTxState,
  approvalTxState,
  withAmount,
  hasAmount,
  helperText,
  sx,
  handleRetry,
  handleClose,
  children,
  ...rest
}: TxActionsWrapperProps) => {
  const approvalTxError = approvalTxState && approvalTxState.txError;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', ...sx }} {...rest}>
      {!!helperText && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {helperText}
        </Box>
      )}

      {(mainTxState.txError || approvalTxError) && (
        <Button variant="outlined" onClick={handleRetry} sx={{ mb: 2 }}>
          <Trans>Retry with approval</Trans>
        </Button>
      )}

      {withAmount && !hasAmount && !approvalTxError && (
        <Button variant="outlined" disabled>
          <Trans>Enter an amount</Trans>
        </Button>
      )}

      {children}

      {(mainTxState.txHash || mainTxState.txError || approvalTxError) && (
        <Button onClick={handleClose} variant="contained">
          {!mainTxState.txError && !approvalTxError && <Trans>Ok,</Trans>} <Trans>Close</Trans>
        </Button>
      )}
    </Box>
  );
};
