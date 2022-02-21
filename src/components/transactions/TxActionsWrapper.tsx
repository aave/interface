import { Trans } from '@lingui/macro';
import { Box, BoxProps, Button, CircularProgress } from '@mui/material';
import { ReactNode } from 'react';
import { TxStateType } from 'src/hooks/useModal';

interface TxActionsWrapperProps extends BoxProps {
  actionInProgressText: ReactNode;
  actionText: ReactNode;
  amount?: string;
  approvalTxState?: TxStateType;
  handleApproval?: () => Promise<void>;
  handleAction: () => Promise<void>;
  handleRetry?: () => void;
  helperText?: ReactNode;
  isWrongNetwork: boolean;
  mainTxState: TxStateType;
  preparingTransactions: boolean;
  requiresAmount?: boolean;
  requiresApproval?: boolean;
  symbol?: string;
}

export const TxActionsWrapper = ({
  actionInProgressText,
  actionText,
  amount,
  approvalTxState,
  handleApproval,
  handleAction,
  handleRetry,
  helperText,
  isWrongNetwork,
  mainTxState,
  preparingTransactions,
  requiresAmount,
  requiresApproval,
  sx,
  symbol,
  ...rest
}: TxActionsWrapperProps) => {
  const hasApprovalError = requiresApproval && (approvalTxState?.txError || mainTxState?.txError);
  const isAmountMissing = requiresAmount && requiresAmount && Number(amount) === 0;

  function getMainParams() {
    if (isWrongNetwork) return { disabled: true, content: <Trans>Switch Network</Trans> };
    if (isAmountMissing) return { disabled: true, content: <Trans>Enter an amount</Trans> };
    if (preparingTransactions) return { disabled: true, loading: true };
    if (hasApprovalError && handleRetry)
      return { content: <Trans>Retry with approval</Trans>, handleClick: handleRetry };
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
    return { content: <Trans>Approve to continue</Trans>, handleClick: handleApproval };
  }

  const { content, disabled, loading, handleClick } = getMainParams();
  const approvalParams = getApprovalParams();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 12, ...sx }} {...rest}>
      {!!helperText && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {helperText}
        </Box>
      )}

      {approvalParams && (
        <Button
          variant="contained"
          disabled={approvalParams.disabled}
          onClick={approvalParams.handleClick}
          size="large"
          sx={{ minHeight: '44px' }}
        >
          {approvalParams.loading && (
            <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          )}
          {approvalParams.content}
        </Button>
      )}

      <Button
        variant="contained"
        disabled={disabled}
        onClick={handleClick}
        size="large"
        sx={{ minHeight: '44px', ...(approvalParams ? { mt: 2 } : {}) }}
      >
        {loading && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
        {content}
      </Button>
    </Box>
  );
};
