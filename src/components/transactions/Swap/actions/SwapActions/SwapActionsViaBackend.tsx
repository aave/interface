import { sendTransactionAndWait } from '@aave/client/viem';
import {
  bigDecimal,
  chainId as sdkChainId,
  dateTime,
  evmAddress,
  OrderHandlerError,
  OrderHandlerResult,
  OrderTypedData,
  PermitTypedDataResponse,
  signatureFrom,
  SigningError,
  TokenSwapKind,
  TokenSwapOrderPlan,
  UnexpectedError,
  useTokenSwapOrder,
} from '@aave/react';
import { Trans } from '@lingui/macro';
import { BigNumber } from 'bignumber.js';
import { errAsync, ResultAsync } from 'neverthrow';
import { Dispatch } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { TypedData, TypedDataDomain, WalletClient } from 'viem';
import { useWalletClient } from 'wagmi';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { isNativeToken } from '../../helpers/cow';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import {
  areActionsBlocked,
  ExpiryToSecondsMap,
  isBackendRates,
  isShieldBlocked,
  OrderType,
  SwappableToken,
  SwapParams,
  SwapState,
} from '../../types';

export const signTypedDataWith = (
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

export const toLimitAmount = (token: SwappableToken, amount: string) =>
  bigDecimal(BigNumber(amount).decimalPlaces(token.decimals, BigNumber.ROUND_DOWN).toFixed());

// The user's limit amounts, before fees: the backend applies them when it quotes the limit order.
const toLimitTokenInput = (token: SwappableToken, amount: string) => {
  const value = toLimitAmount(token, amount);
  return isNativeToken(token.addressToSwap)
    ? { native: value }
    : { erc20: { address: evmAddress(token.addressToSwap), value } };
};

/**
 * Token swap placed through the Aave backend: it runs the quote's approvals (permit or
 * transaction), then signs the order or, for native sells, sends the order transaction.
 * Market orders execute the quote shown; limit orders are quoted at the user's price on submit.
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

    const isLimit = state.orderType === OrderType.LIMIT;
    if (isLimit && isNativeToken(state.sourceToken.addressToSwap)) {
      // A native limit sell would lock the funds in eth-flow until it fills or expires.
      setTxError(
        getErrorTextFromError(
          new Error(
            'Native sell token is not supported in limit orders. Please use the wrapped token.'
          ),
          TxAction.MAIN_ACTION,
          true
        )
      );
      return;
    }

    // Loading also pauses the quote refresh, so the quote id stays the one shown.
    setMainTxState({ ...mainTxState, loading: true });

    const market = evmAddress(state.swapRate.market);
    const result = await placeOrder(
      isLimit
        ? {
            limit: {
              market,
              chainId: sdkChainId(state.chainId),
              sell: toLimitTokenInput(state.sourceToken, state.inputAmount),
              buy: toLimitTokenInput(state.destinationToken, state.outputAmount),
              user: evmAddress(state.user),
              kind: state.side === 'buy' ? TokenSwapKind.Buy : TokenSwapKind.Sell,
              deadline: dateTime(
                new Date(Date.now() + ExpiryToSecondsMap[state.expiry] * 1000).toISOString()
              ),
            },
          }
        : { fromQuote: { market, quoteId: state.swapRate.backendQuote.quoteId } }
    );

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
