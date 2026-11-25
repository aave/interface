import { sendTransactionAndWait } from '@aave/client/viem';
import {
  evmAddress,
  OrderHandlerError,
  OrderHandlerResult,
  OrderTypedData,
  PermitTypedDataResponse,
  signatureFrom,
  SigningError,
  TokenSwapOrderPlan,
  UnexpectedError,
  useTokenSwapOrder,
} from '@aave/react';
import { Trans } from '@lingui/macro';
import { errAsync, ResultAsync } from 'neverthrow';
import { Dispatch } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { TypedData, TypedDataDomain, WalletClient } from 'viem';
import { useWalletClient } from 'wagmi';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import {
  areActionsBlocked,
  isBackendRates,
  isShieldBlocked,
  SwapParams,
  SwapState,
} from '../../types';

const signTypedDataWith = (
  walletClient: WalletClient,
  data: OrderTypedData | PermitTypedDataResponse
): ResultAsync<OrderHandlerResult, OrderHandlerError> => {
  if (!walletClient.account) {
    return errAsync(UnexpectedError.from('Wallet account is required'));
  }
  return ResultAsync.fromPromise(
    walletClient.signTypedData({
      account: walletClient.account,
      domain: data.domain as TypedDataDomain,
      types: data.types as TypedData,
      primaryType: data.primaryType,
      message: data.message as Record<string, unknown>,
    }),
    (error) => SigningError.from(error)
  ).map(signatureFrom);
};

/**
 * Token swap placed through the Aave backend: it runs the quote's approvals (permit or
 * transaction), then signs the order or, for native sells, sends the order transaction.
 */
export const SwapActionsViaBackend = ({
  state,
  setState,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const { mainTxState, loadingTxns, setMainTxState, setTxError, approvalTxState } =
    useModalContext();
  const { data: walletClient } = useWalletClient({ chainId: state.chainId });

  useSwapGasEstimation({
    state,
    setState,
    requiresApproval: false,
    requiresApprovalReset: false,
    approvalTxState,
  });

  const [placeOrder] = useTokenSwapOrder((plan: TokenSwapOrderPlan) => {
    if (!walletClient) return errAsync(UnexpectedError.from('Wallet is not connected'));
    switch (plan.__typename) {
      case 'Erc20Approval':
        return plan.byPermit
          ? signTypedDataWith(walletClient, plan.byPermit)
          : sendTransactionAndWait(walletClient, plan.byTransaction);
      case 'OrderTypedData':
        return signTypedDataWith(walletClient, plan);
      case 'OrderTransactionRequest':
        return sendTransactionAndWait(walletClient, plan.transaction);
    }
  });

  const action = async () => {
    if (!isBackendRates(state.swapRate) || !walletClient) return;

    // Loading also pauses the quote refresh, so the quote id stays the one shown.
    setMainTxState({ ...mainTxState, loading: true });

    const result = await placeOrder({
      fromQuote: {
        market: evmAddress(state.swapRate.market),
        quoteId: state.swapRate.backendQuote.quoteId,
      },
    });

    if (result.isErr()) {
      console.error('SwapActionsViaBackend error', result.error);
      setTxError(getErrorTextFromError(result.error, TxAction.MAIN_ACTION, false));
      setMainTxState({ loading: false, success: false });
      setState({ actionsLoading: false });
    } else {
      setMainTxState({ loading: false, success: true, txHash: result.value.orderId });
    }

    trackingHandlers.trackSwap();
  };

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={state.isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={state.processedSide === 'sell' ? state.sellAmountFormatted : state.buyAmountFormatted}
      requiresApproval={false}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      errorParams={{
        loading: false,
        disabled: areActionsBlocked(state),
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      fetchingData={state.actionsLoading}
      blocked={areActionsBlocked(state)}
      blockedText={isShieldBlocked(state) ? <Trans>Blocked by Shield</Trans> : undefined}
    />
  );
};
