import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  BoxProps,
  Button,
  CircularProgress,
  SvgIcon,
  Typography,
  useTheme,
} from '@mui/material';
import React, { ReactNode } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { TxStateType, useModalContext } from 'src/hooks/useModal';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { TrackEventProps } from 'src/store/analyticsSlice';
import { TxAction } from 'src/ui-config/errorMapping';

import { ApprovalTooltip } from '../infoTooltips/ApprovalTooltip';
import { RightHelperText } from './FlowCommons/RightHelperText';

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
  fetchingData?: boolean;
  errorParams?: {
    loading: boolean;
    disabled: boolean;
    content: ReactNode;
    handleClick: () => Promise<void>;
  };
  tryPermit?: boolean;
  event?: TrackEventProps;
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
  fetchingData = false,
  errorParams,
  tryPermit,
  event,
  ...rest
}: TxActionsWrapperProps) => {
  const { txError } = useModalContext();
  const { readOnlyModeAddress } = useWeb3Context();
  const { gasFeeTonMarketReferenceCurrencyTON, balanceTokenTON } = useAppDataContext();
  const { isConnectedTonWallet } = useTonConnectContext();
  const hasApprovalError =
    requiresApproval && txError?.txAction === TxAction.APPROVAL && txError?.actionBlocked;
  const isAmountMissing = requiresAmount && requiresAmount && Number(amount) === 0;

  const showNotEnoughFeesTON =
    Number(balanceTokenTON) < Number(gasFeeTonMarketReferenceCurrencyTON) &&
    !isAmountMissing &&
    isConnectedTonWallet;

  function getMainParams() {
    // start with ton connect
    if (isConnectedTonWallet && isAmountMissing)
      return { disabled: true, content: <Trans>Enter an amount</Trans> };
    if (isConnectedTonWallet && preparingTransactions) return { disabled: true, loading: true };
    if (isConnectedTonWallet && mainTxState?.loading)
      return { loading: true, disabled: true, content: actionInProgressText };
    if (isConnectedTonWallet && showNotEnoughFeesTON)
      return { loading: false, disabled: true, content: actionText };
    if (isConnectedTonWallet && !mainTxState?.loading && !showNotEnoughFeesTON)
      return { content: actionText, handleClick: handleAction };
    // end with ton connect

    if (blocked) return { disabled: true, content: actionText };
    if (
      (txError?.txAction === TxAction.GAS_ESTIMATION ||
        txError?.txAction === TxAction.MAIN_ACTION) &&
      txError?.actionBlocked
    ) {
      if (errorParams) return errorParams;
      return { loading: false, disabled: true, content: actionText };
    }
    if (isWrongNetwork) return { disabled: true, content: <Trans>Wrong Network</Trans> };
    if (fetchingData) return { disabled: true, content: <Trans>Fetching data...</Trans> };
    if (isAmountMissing) return { disabled: true, content: <Trans>Enter an amount</Trans> };
    if (preparingTransactions) return { disabled: true, loading: true };
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
      (!requiresApproval ||
        isWrongNetwork ||
        isAmountMissing ||
        preparingTransactions ||
        hasApprovalError) &&
      !showNotEnoughFeesTON
    )
      return null;
    if (approvalTxState?.loading)
      return { loading: true, disabled: true, content: <Trans>Approving {symbol}...</Trans> };
    if (approvalTxState?.success)
      return {
        disabled: true,
        content: (
          <>
            <Trans>Approving {symbol}</Trans>
            <SvgIcon sx={{ fontSize: 24, ml: 2 }}>
              <CheckIcon />
            </SvgIcon>
          </>
        ),
      };

    return {
      content: (
        <ApprovalTooltip
          variant="buttonL"
          iconSize={18}
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

  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }} {...rest}>
      {approvalParams && !readOnlyModeAddress && (
        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center', mt: 5, mb: 12 }}>
          <RightHelperText approvalHash={approvalTxState?.txHash} tryPermit={tryPermit} />
        </Box>
      )}

      {approvalParams && !readOnlyModeAddress && (
        <Button
          variant="contained"
          disabled={approvalParams.disabled || blocked}
          onClick={() => approvalParams.handleClick && approvalParams.handleClick()}
          size="large"
          sx={{ minHeight: '44px', mt: 12 }}
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
        disabled={disabled || blocked || readOnlyModeAddress !== undefined}
        onClick={handleClick}
        size="large"
        sx={{
          minHeight: '44px',
          p: 3,
          mt: 12,
          ...(approvalParams ? { mt: 2 } : {}),
          ...(disabled
            ? {
                bgcolor: theme.palette.text.disabledBg,
                color: theme.palette.text.disabledText,
              }
            : {}),
          bgcolor: theme.palette.point.primary,
          color: theme.palette.text.buttonText,
        }}
        data-cy="actionButton"
      >
        {loading && <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />}
        {content}
      </Button>
      {readOnlyModeAddress && (
        <Typography variant="helperText" color="warning.main" sx={{ textAlign: 'center', mt: 2 }}>
          <Trans>Read-only mode. Connect to a wallet to perform transactions.</Trans>
        </Typography>
      )}
    </Box>
  );
};
