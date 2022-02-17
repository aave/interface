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
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 12, ...sx }} {...rest}>
      {!!helperText && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {helperText}
        </Box>
      )}

      {(mainTxState.txError || approvalTxError) && (
        <Button
          variant="contained"
          onClick={handleRetry}
          size="large"
          sx={{ mb: 2, minHeight: '44px' }}
        >
          <Trans>Retry with approval</Trans>
        </Button>
      )}

      {withAmount && !hasAmount && !approvalTxError && (
        <Button variant="contained" disabled size="large" sx={{ minHeight: '44px' }}>
          <Trans>Enter an amount</Trans>
        </Button>
      )}

      {children}

      {(mainTxState.txHash || mainTxState.txError || approvalTxError) && (
        <Button onClick={handleClose} variant="contained" size="large" sx={{ minHeight: '44px' }}>
          {!mainTxState.txError && !approvalTxError && <Trans>Ok,</Trans>} <Trans>Close</Trans>
        </Button>
      )}
    </Box>
  );
};
