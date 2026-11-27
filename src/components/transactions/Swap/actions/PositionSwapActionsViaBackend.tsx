import { sendTransactionAndWait } from '@aave/client/viem';
import {
  BorrowSwapKind,
  dateTime,
  OrderPlan,
  PositionSwapOrderPlan,
  RepayWithSupplyKind,
  SupplySwapKind,
  UnexpectedError,
  useBorrowSwapOrder,
  useLeverage,
  useRepayWithSupplyOrder,
  useSupplySwapOrder,
  useWithdrawSwapOrder,
  WithdrawSwapKind,
} from '@aave/react';
import { OrderStatus } from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { errAsync } from 'neverthrow';
import { Dispatch } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { saveCowOrderToUserHistory } from 'src/utils/swapAdapterHistory';
import { useWalletClient } from 'wagmi';

import { TrackAnalyticsHandlers } from '../analytics/useTrackAnalytics';
import { useSwapGasEstimation } from '../hooks/useSwapGasEstimation';
import { positionSwapLegs, toSwapTokenInput } from '../hooks/useSwapQuote';
import {
  areActionsBlocked,
  BackendRatesType,
  ExpiryToSecondsMap,
  isBackendRates,
  isLeverageQuoteUnchosen,
  isShieldBlocked,
  isSwapQuote,
  OrderType,
  ProtocolSwapParams,
  ProtocolSwapState,
  SwapState,
  SwapType,
} from '../types';
import {
  approveWith,
  signTypedDataWith,
  toLimitAmount,
  useBackendOrderErrorHandler,
  useIsPermitInUse,
} from './SwapActions/SwapActionsViaBackend';

/**
 * Order ids owned by an adapter instance, which the CoW owner query never lists. A withdraw and
 * swap has no adapter: the user owns that order, so the owner query lists it.
 */
const ADAPTER_SWAP_TYPES = [
  SwapType.CollateralSwap,
  SwapType.DebtSwap,
  SwapType.RepayWithCollateral,
  SwapType.Leverage,
];

const actionTexts = (state: SwapState) => {
  switch (state.swapType) {
    case SwapType.CollateralSwap:
      return {
        action: <Trans>Swap {state.sourceToken.symbol} collateral</Trans>,
        inProgress: <Trans>Swapping {state.sourceToken.symbol} collateral</Trans>,
      };
    case SwapType.DebtSwap:
      return {
        action: <Trans>Swap {state.sourceToken.symbol} debt</Trans>,
        inProgress: <Trans>Swapping {state.sourceToken.symbol} debt</Trans>,
      };
    case SwapType.RepayWithCollateral:
      return {
        action: (
          <Trans>
            Repay {state.sourceToken.symbol} with {state.destinationToken.symbol}
          </Trans>
        ),
        inProgress: (
          <Trans>
            Repaying {state.sourceToken.symbol} with {state.destinationToken.symbol}
          </Trans>
        ),
      };
    case SwapType.Leverage:
      return {
        action: <Trans>Leverage {state.sourceToken.symbol}</Trans>,
        inProgress: <Trans>Leveraging {state.sourceToken.symbol}</Trans>,
      };
    default:
      return { action: <Trans>Swap</Trans>, inProgress: <Trans>Swapping</Trans> };
  }
};

/**
 * Position swap placed through the Aave backend. The SDK hook quotes it (the quote shown for
 * market orders, the user's price for limit orders), runs its approvals (aToken permit or
 * approval, adapter signature or transaction) and signs and submits the order.
 */
export const PositionSwapActionsViaBackend = ({
  state,
  setState,
  trackingHandlers,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const { mainTxState, loadingTxns, setMainTxState, approvalTxState } = useModalContext();
  const { data: walletClient } = useWalletClient({ chainId: state.chainId });
  const permitInUse = useIsPermitInUse(state);
  const onError = useBackendOrderErrorHandler(setState);

  useSwapGasEstimation({
    state,
    setState,
    requiresApproval: false,
    requiresApprovalReset: false,
    approvalTxState,
  });

  const handler = (plan: PositionSwapOrderPlan) => {
    if (!walletClient) return errAsync(UnexpectedError.from('Wallet is not connected'));
    switch (plan.__typename) {
      case 'Erc20Approval':
        return approveWith(walletClient, plan, permitInUse);
      case 'PositionSwapAdapterContractApproval':
        return signTypedDataWith(walletClient, plan.bySignature);
      case 'PositionSwapAdapterTransactionApproval':
        return sendTransactionAndWait(walletClient, plan.byTransaction);
      case 'OrderTypedData':
        return signTypedDataWith(walletClient, plan);
      case 'OrderTransactionRequest':
        return sendTransactionAndWait(walletClient, plan.transaction);
    }
  };
  const [placeSupplySwap] = useSupplySwapOrder(handler);
  const [placeWithdrawSwap] = useWithdrawSwapOrder(handler);
  const [placeBorrowSwap] = useBorrowSwapOrder(handler);
  const [placeRepayWithSupply] = useRepayWithSupplyOrder(handler);
  const [placeLeverage] = useLeverage((plan: OrderPlan) => {
    if (!walletClient) return errAsync(UnexpectedError.from('Wallet is not connected'));
    switch (plan.__typename) {
      case 'OrderErc20Approval':
        return approveWith(walletClient, plan, permitInUse);
      case 'OrderAdapterApproval':
        return signTypedDataWith(walletClient, plan.bySignature);
      case 'OrderAdapterTransactionApproval':
        return sendTransactionAndWait(walletClient, plan.byTransaction);
      case 'OrderTypedData':
        return signTypedDataWith(walletClient, plan);
      case 'OrderTransactionRequest':
        return sendTransactionAndWait(walletClient, plan.transaction);
    }
  });

  const placeOrder = (rates: BackendRatesType) => {
    const quote = rates.backendQuote;
    // Market only: the shown quote is the order, the hook re-quotes from its id.
    if (!isSwapQuote(quote)) return placeLeverage({ fromQuote: { quoteId: quote.quoteId } });

    const legs = positionSwapLegs(state, rates.market);
    const fromQuote = { quoteId: quote.quoteId };
    const limit = state.orderType === OrderType.LIMIT;
    const fixesDestination = state.side === 'buy';
    const sourceAmount = toLimitAmount(state.sourceToken, state.inputAmount);
    const destinationAmount = toLimitAmount(state.destinationToken, state.outputAmount);
    const deadline = dateTime(
      new Date(Date.now() + ExpiryToSecondsMap[state.expiry] * 1000).toISOString()
    );

    switch (state.swapType) {
      case SwapType.CollateralSwap:
        return placeSupplySwap(
          limit
            ? {
                limit: {
                  currentPosition: legs.sourceSupply,
                  currentAmount: sourceAmount,
                  newReserve: legs.destinationReserve,
                  newAmount: destinationAmount,
                  user: legs.user,
                  kind: fixesDestination ? SupplySwapKind.New : SupplySwapKind.Current,
                  deadline,
                },
              }
            : { fromQuote }
        );
      case SwapType.WithdrawAndSwap:
        return placeWithdrawSwap(
          limit
            ? {
                limit: {
                  withdrawPosition: legs.sourceSupply,
                  withdrawAmount: sourceAmount,
                  buyToken: toSwapTokenInput(state.destinationToken.addressToSwap),
                  buyAmount: destinationAmount,
                  user: legs.user,
                  kind: fixesDestination ? WithdrawSwapKind.Buy : WithdrawSwapKind.Withdraw,
                  deadline,
                },
              }
            : { fromQuote }
        );
      case SwapType.DebtSwap:
        return placeBorrowSwap(
          limit
            ? {
                limit: {
                  currentPosition: legs.sourceBorrow,
                  currentAmount: sourceAmount,
                  newReserve: legs.destinationReserve,
                  newAmount: destinationAmount,
                  user: legs.user,
                  kind: BorrowSwapKind.Current,
                  deadline,
                },
              }
            : { fromQuote }
        );
      case SwapType.RepayWithCollateral:
        return placeRepayWithSupply(
          limit
            ? {
                limit: {
                  repayPosition: legs.sourceBorrow,
                  repayAmount: sourceAmount,
                  supplyPosition: legs.destinationSupply,
                  supplyAmount: destinationAmount,
                  user: legs.user,
                  kind: fixesDestination ? RepayWithSupplyKind.Supply : RepayWithSupplyKind.Repay,
                  deadline,
                },
              }
            : { fromQuote }
        );
      default:
        throw new Error(`Position swap ${state.swapType} is not placed through the backend`);
    }
  };

  const saveToHistory = (orderId: string) => {
    if (!state.sellAmountToken || !state.buyAmountToken) return;
    const token = (t: NonNullable<SwapState['sellAmountToken']>) => ({
      address: t.underlyingAddress,
      symbol: t.symbol,
      name: t.symbol,
      decimals: t.decimals,
    });
    saveCowOrderToUserHistory({
      protocol: 'cow',
      orderId,
      viaBackend: true,
      status: OrderStatus.OPEN,
      swapType: state.swapType,
      chainId: state.chainId,
      account: state.user,
      timestamp: new Date().toISOString(),
      srcToken: token(state.sellAmountToken),
      destToken: token(state.buyAmountToken),
      usedAdapter: true,
      srcAmount: (state.sellAmountBigInt ?? BigInt(0)).toString(),
      destAmount: (state.buyAmountBigInt ?? BigInt(0)).toString(),
    });
  };

  const action = async () => {
    if (!isBackendRates(state.swapRate) || !walletClient) return;

    // Loading also pauses the quote refresh, so the quote id stays the one shown.
    setMainTxState({ ...mainTxState, loading: true });

    try {
      const result = await placeOrder(state.swapRate);
      if (result.isErr()) {
        onError(result.error);
      } else {
        const { orderId } = result.value;
        if (ADAPTER_SWAP_TYPES.includes(state.swapType)) saveToHistory(orderId);
        setMainTxState({ loading: false, success: true, txHash: orderId });
      }
    } catch (error) {
      onError(error);
    }

    trackingHandlers.trackSwap();
  };

  const texts = actionTexts(state);
  const awaitingMultiplier = isLeverageQuoteUnchosen(state);
  const blocked = areActionsBlocked(state) || awaitingMultiplier;
  const blockedText =
    awaitingMultiplier && state.leverageMultiplier === undefined ? (
      <Trans>Choose a multiplier</Trans>
    ) : isShieldBlocked(state) ? (
      <Trans>Blocked by Shield</Trans>
    ) : undefined;
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
      actionText={texts.action}
      actionInProgressText={texts.inProgress}
      errorParams={{
        loading: false,
        disabled: blocked,
        content: texts.action,
        handleClick: action,
      }}
      fetchingData={state.actionsLoading}
      blocked={blocked}
      blockedText={blockedText}
    />
  );
};
