import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, BoxProps, Button, CircularProgress, SvgIcon, Typography } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { ReactNode } from 'react';
import { TxStateType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { TxAction } from 'src/ui-config/errorMapping';

import { ApprovalTooltip } from '../infoTooltips/ApprovalTooltip';
import { ApprovalMethodToggleButton } from './FlowCommons/ApprovalMethodToggleButton';
import { RightHelperText } from './FlowCommons/RightHelperText';

interface TxActionsWrapperProps extends BoxProps {
  actionInProgressText: ReactNode;
  actionText: ReactNode;
  amount?: string;
  approvalTxState?: TxStateType;
  handleApproval?: (forceApproval?: boolean) => Promise<void>;
  handleAction: () => Promise<void>;
  isWrongNetwork: boolean;
  mainTxState: TxStateType;
  preparingTransactions: boolean;
  requiresAmount?: boolean;
  requiresApproval: boolean;
  symbol?: string;
  blocked?: boolean;
  tryPermit?: boolean;
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
  tryPermit,
  ...rest
}: TxActionsWrapperProps) => {
  const { txError } = useModalContext();
  const { watchModeOnlyAddress } = useWeb3Context();
  const [walletApprovalMethodPreference, setWalletApprovalMethodPreference] = useRootStore(
    (state) => [state.walletApprovalMethodPreference, state.setWalletApprovalMethodPreference]
  );

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
    if (approvalTxState?.success)
      return {
        disabled: true,
        content: (
          <>
            <Trans>Approve Confirmed</Trans>
            <SvgIcon sx={{ fontSize: 20, ml: 2 }}>
              <CheckIcon />
            </SvgIcon>
          </>
        ),
      };

    return {
      content: (
        <ApprovalTooltip
          variant="buttonL"
          iconSize={20}
          iconMargin={2}
          color="white"
          text={<Trans>Approve {symbol} to continue</Trans>}
        />
      ),
      handleClick: handleApproval,
    };
  }

  const { content, disabled, loading, handleClick } = getMainParams();
  const approvalParams = getApprovalParams();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 12, ...sx }} {...rest}>
      {requiresApproval && !watchModeOnlyAddress && (
        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
          <RightHelperText
            approvalHash={approvalTxState?.txHash}
            tryPermit={tryPermit}
            approvalMethodToggleButton={
              <ApprovalMethodToggleButton
                currentMethod={walletApprovalMethodPreference}
                setMethod={(method: ApprovalMethod) => setWalletApprovalMethodPreference(method)}
              />
            }
          />
        </Box>
      )}

      {approvalParams && !watchModeOnlyAddress && (
        <Button
          variant="contained"
          disabled={approvalParams.disabled || blocked}
          onClick={() => approvalParams.handleClick && approvalParams.handleClick()}
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
        disabled={disabled || blocked || watchModeOnlyAddress !== undefined}
        onClick={handleClick}
        size="large"
        sx={{ minHeight: '44px', ...(approvalParams ? { mt: 2 } : {}) }}
        data-cy="actionButton"
      >
        {loading && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
        {content}
      </Button>
      {watchModeOnlyAddress && (
        <Typography variant="helperText" color="warning.main" sx={{ textAlign: 'center', mt: 2 }}>
          <Trans>Watch-only mode. Connect to a wallet to perform transactions.</Trans>
        </Typography>
      )}
    </Box>
  );
};
