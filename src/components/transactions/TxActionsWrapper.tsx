import { Trans } from '@lingui/macro';
import { Box, BoxProps, Button, CircularProgress, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { TxStateType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import isEmpty from 'lodash/isEmpty';
import { LeftHelperText } from './FlowCommons/LeftHelperText';
import { RightHelperText } from './FlowCommons/RightHelperText';
import { TxAction } from 'src/ui-config/errorMapping';

interface TxActionsWrapperProps extends BoxProps {
  actionInProgressText: ReactNode;
  actionText: ReactNode;
  amount?: string;
  approvalTxState?: TxStateType;
  handleApproval?: () => Promise<void>;
  handleAction: () => Promise<void>;
  isWrongNetwork: boolean;
  mainTxState: TxStateType;
  preparingTransactions: boolean;
  requiresAmount?: boolean;
  requiresApproval: boolean;
  symbol?: string;
  blocked?: boolean;
}

export const TxActionsWrapper = ({
  actionInProgressText,
  actionText,
  amount,
  approvalTxState,
  handleApproval,
  handleAction,
  isWrongNetwork,
  mainTxState,
  preparingTransactions,
  requiresAmount,
  requiresApproval,
  sx,
  symbol,
  blocked,
  ...rest
}: TxActionsWrapperProps) => {
  const { txError, retryWithApproval } = useModalContext();
  const { mockAddress } = useWeb3Context();

  const hasApprovalError =
    requiresApproval && txError && txError.txAction === TxAction.APPROVAL && txError.actionBlocked;
  const isAmountMissing = requiresAmount && requiresAmount && Number(amount) === 0;

  function getMainParams() {
    if (blocked) return { disabled: true, content: actionText };
    if (txError && txError.txAction === TxAction.GAS_ESTIMATION && txError.actionBlocked)
      return { loading: false, disabled: true, content: actionText };
    if (txError && txError.txAction === TxAction.MAIN_ACTION && txError.actionBlocked)
      return { loading: false, disabled: true, content: actionText };
    if (isWrongNetwork) return { disabled: true, content: <Trans>Wrong Network</Trans> };
    if (isAmountMissing) return { disabled: true, content: <Trans>Enter an amount</Trans> };
    if (preparingTransactions || isEmpty(mainTxState)) return { disabled: true, loading: true };
    // if (hasApprovalError && handleRetry)
    //   return { content: <Trans>Retry with approval</Trans>, handleClick: handleRetry };
    if (mainTxState?.loading)
      return { loading: true, disabled: true, content: actionInProgressText };
    if (requiresApproval && !approvalTxState?.success)
      return { disabled: true, content: actionText };
    return { content: actionText, handleClick: handleAction };
  }

  function getApprovalParams() {
    if (
      !requiresApproval ||
      isWrongNetwork ||
      isAmountMissing ||
      preparingTransactions ||
      hasApprovalError
    )
      return null;
    if (approvalTxState?.loading)
      return { loading: true, disabled: true, content: <Trans>Approving {symbol}...</Trans> };
    if (approvalTxState?.success) return { disabled: true, content: <Trans>Approved</Trans> };
    if (retryWithApproval)
      return { content: <Trans>Retry with approval</Trans>, handleClick: handleApproval };
    return { content: <Trans>Approve to continue</Trans>, handleClick: handleApproval };
  }

  const { content, disabled, loading, handleClick } = getMainParams();
  const approvalParams = getApprovalParams();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 12, ...sx }} {...rest}>
      {requiresApproval && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <LeftHelperText amount={amount} approvalHash={approvalTxState?.txHash} />
          <RightHelperText approvalHash={approvalTxState?.txHash} />
        </Box>
      )}

      {approvalParams && (
        <Button
          variant="contained"
          disabled={approvalParams.disabled || blocked}
          onClick={approvalParams.handleClick}
          size="large"
          sx={{ minHeight: '44px' }}
          data-cy="approvalButton"
        >
          {approvalParams.loading && (
            <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          )}
          {approvalParams.content}
        </Button>
      )}

      <Button
        variant="contained"
        disabled={disabled || blocked || mockAddress !== undefined}
        onClick={handleClick}
        size="large"
        sx={{ minHeight: '44px', ...(approvalParams ? { mt: 2 } : {}) }}
        data-cy="actionButton"
      >
        {loading && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
        {content}
      </Button>
      {mockAddress && (
        <Typography variant="helperText" sx={{ color: 'warning.main', textAlign: 'center', mt: 2 }}>
          <Trans>Watch-only mode. Connect to a wallet to perform transactions.</Trans>
        </Typography>
      )}
    </Box>
  );
};
