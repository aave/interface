import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { InformationCircleIcon } from '@heroicons/react/outline';
import { Box, BoxProps, Button, SvgIcon, CircularProgress, Typography } from '@mui/material';
import isEmpty from 'lodash/isEmpty';
import { ReactNode } from 'react';
import { uiConfig } from '../../uiConfig';
import { TxStateType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useHelpContext } from 'src/hooks/useHelp';
import { TxAction } from 'src/ui-config/errorMapping';

import { ApprovalTooltip } from '../infoTooltips/ApprovalTooltip';
import { RightHelperText } from './FlowCommons/RightHelperText';

import { HelpTooltip } from 'src/components/infoTooltips/HelpTooltip';

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
  ...rest
}: TxActionsWrapperProps) => {
  const { txError } = useModalContext();
  const { readOnlyModeAddress } = useWeb3Context();

  const hasApprovalError =
    requiresApproval && txError?.txAction === TxAction.APPROVAL && txError?.actionBlocked;
  const isAmountMissing = requiresAmount && requiresAmount && Number(amount) === 0;

  function getMainParams() {
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
  const { pagination, tourInProgress } = useHelpContext();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: 12, ...sx }} {...rest}>
      {requiresApproval && !readOnlyModeAddress && (
        <Box sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
          <RightHelperText approvalHash={approvalTxState?.txHash} tryPermit={tryPermit} />
        </Box>
      )}
      {(pagination['SupplyTour'] === 6 || pagination['WithdrawTour'] === 5) && (
        <HelpTooltip
          title={
            tourInProgress !== 'Withdrawal Tour'
              ? 'Approval for first supply'
              : 'Withdraw your assets'
          }
          description={
            <Box>
              {tourInProgress !== 'Withdrawal Tour' ? (
                <Box>
                  The first supply of one asset will require an additional approval transaction on
                  your wallet.
                </Box>
              ) : (
                <Box>This will trigger your wallet and you will need to sign your transaction</Box>
              )}
              <Box sx={{ objectFit: 'cover', mt: 2 }}>
                <img
                  src={
                    tourInProgress !== 'Withdrawal Tour'
                      ? uiConfig.approveButtonImage
                      : localStorage.getItem('colorMode') === 'light' ||
                        !localStorage.getItem('colorMode')
                      ? uiConfig.withdrawButtonImageLight
                      : uiConfig.withdrawButtonImageDark
                  }
                  alt="Image of withdraw button"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </Box>
              {tourInProgress !== 'Withdrawal Tour' && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SvgIcon
                    sx={{
                      color: '#0A91FF',
                      fontSize: { xs: '15px', xsm: '15px' },
                      mb: '6px',
                      mr: '10px',
                    }}
                  >
                    <InformationCircleIcon />
                  </SvgIcon>
                  <Typography sx={{ mt: 4 }}>
                    You can enter an amount on the input feel to see it working.
                  </Typography>
                </Box>
              )}
            </Box>
          }
          pagination={
            tourInProgress !== 'Withdrawal Tour'
              ? pagination['SupplyTour']
              : pagination['WithdrawTour']
          }
          top={tourInProgress !== 'Withdrawal Tour' ? '340px' : '380px'}
          right={tourInProgress !== 'Withdrawal Tour' ? '15px' : '385px'}
          placement={tourInProgress !== 'Withdrawal Tour' ? 'top-start' : 'left'}
          offset={tourInProgress !== 'Withdrawal Tour' ? [400, -5] : [0, 15]}
        />
      )}
      {approvalParams && (
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
      {(pagination['SupplyTour'] === 7 || pagination['WithdrawTour'] === 6) && (
        <HelpTooltip
          title={'Submit your transaction'}
          description={
            <Box>
              <Box>
                <img
                  src={
                    tourInProgress !== 'Withdrawal Tour'
                      ? uiConfig.metamaskSupply
                      : uiConfig.metamaskWithdraw
                  }
                  alt="SVG of approve and supply button"
                  style={{ maxWidth: '100%', maxHeight: '100%' }}
                />
              </Box>
              {tourInProgress !== 'Withdrawal Tour' ? (
                <Typography sx={{ mt: 1 }}>
                  Submit your transaction. Once the transaction is confirmed, your supply is
                  successfully registered and you begin earning interest.
                  <Typography sx={{ mt: 4 }}>You can use different Wallets.</Typography>
                </Typography>
              ) : (
                <Typography sx={{ mt: 1 }}>
                  Once the transaction is completed you will receive the tokens together with the
                  rewards earned in your wallet.
                </Typography>
              )}
            </Box>
          }
          pagination={
            tourInProgress !== 'Withdrawal Tour'
              ? pagination['SupplyTour']
              : pagination['WithdrawTour']
          }
          top={'375px'}
          right={'15px'}
          placement={'top-start'}
          offset={[400, -50]}
        />
      )}
      <Button
        variant="contained"
        disabled={disabled || blocked || readOnlyModeAddress !== undefined}
        onClick={handleClick}
        size="large"
        sx={{ minHeight: '44px', ...(approvalParams ? { mt: 2 } : {}) }}
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
