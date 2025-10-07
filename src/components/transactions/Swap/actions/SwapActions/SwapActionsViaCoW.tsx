import {
  calculateUniqueOrderId,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  OrderKind,
  SupportedChainId,
} from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { BigNumber } from 'ethers';
import stringify from 'json-stringify-deterministic';
import { Dispatch, useEffect } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { isSmartContractWallet } from 'src/helpers/provider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { COW_APP_DATA, VALID_TO_HALF_HOUR } from '../../constants/cow.constants';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import {
  buyAmountWithCostsIncluded,
  getPreSignTransaction,
  getUnsignerOrder,
  isNativeToken,
  populateEthFlowTx,
  sellAmountWithCostsIncluded,
  sendOrder,
  uploadAppData,
} from '../../helpers/cow';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { isCowProtocolRates, OrderType, SwapParams, SwapState } from '../../types';
import { useSwapTokenApproval } from '../approval/useSwapTokenApproval';

export const SwapActionsViaCoW = ({
  params,
  state,
  setState,
  trackingHandlers,
}: {
  params: SwapParams;
  state: SwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [user, estimateGasLimit, addTransaction] = useRootStore(
    useShallow((state) => [state.account, state.estimateGasLimit, state.addTransaction])
  );

  const { mainTxState, loadingTxns, setMainTxState, setTxError, approvalTxState } =
    useModalContext();

  const { requiresApproval, requiresApprovalReset, approval, tryPermit } = useSwapTokenApproval({
    chainId: state.chainId,
    token: state.sourceToken.addressToSwap,
    symbol: state.sourceToken.symbol,
    amount: state.inputAmount,
    decimals: state.sourceToken.decimals,
    spender: isCowProtocolRates(state.swapRate)
      ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS[state.chainId as SupportedChainId]
      : undefined,
    setState,
    allowPermit: false, // CoW does not support permit
  });

  // Use centralized gas estimation
  useSwapGasEstimation({
    state,
    setState,
    requiresApproval,
    requiresApprovalReset,
    approvalTxState,
  });

  const { sendTx } = useWeb3Context();

  const slippageInPercent = state.slippage;
  const sellAmountAccountingCosts = sellAmountWithCostsIncluded(state);
  const buyAmountAccountingCosts = buyAmountWithCostsIncluded(state);

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });
    if (isCowProtocolRates(state.swapRate)) {
      if (state.useFlashloan) {
        setTxError(
          getErrorTextFromError(new Error('Please use flashloan'), TxAction.MAIN_ACTION, true)
        );
        setState({
          actionsLoading: false,
        });
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
        return;
      }

      try {
        const provider = await getEthersProvider(wagmiConfig, { chainId: state.chainId });
        const slippageBps =
          state.orderType === OrderType.LIMIT ? 0 : Math.round(Number(slippageInPercent) * 100); // percent to bps
        const smartSlippage = state.swapRate.suggestedSlippage == Number(slippageInPercent);
        const appCode = APP_CODE_PER_SWAP_TYPE[params.swapType];

        // If srcToken is native, we need to use the eth-flow instead of the orderbook
        if (isNativeToken(state.sourceToken.addressToSwap)) {
          const ethFlowTx = await populateEthFlowTx(
            sellAmountAccountingCosts,
            buyAmountAccountingCosts,
            state.destinationToken.addressToSwap,
            user,
            VALID_TO_HALF_HOUR,
            state.sourceToken.symbol,
            state.destinationToken.symbol,
            slippageBps,
            smartSlippage,
            appCode,
            state.orderType,
            state.swapRate.quoteId
          );
          const txWithGasEstimation = await estimateGasLimit(ethFlowTx, state.chainId);
          let response;
          try {
            response = await sendTx(txWithGasEstimation);
            addTransaction(
              response.hash,
              {
                txState: 'success',
              },
              {
                chainId: state.chainId,
              }
            );

            setMainTxState({
              loading: false,
              success: true,
            });

            const unsignerOrder = await getUnsignerOrder({
              sellAmount: sellAmountAccountingCosts,
              buyAmount: buyAmountAccountingCosts,
              dstToken: state.destinationToken.addressToSwap,
              user,
              chainId: state.chainId,
              tokenFromSymbol: state.sourceToken.symbol,
              tokenToSymbol: state.destinationToken.symbol,
              slippageBps,
              smartSlippage,
              appCode,
              orderType: state.orderType,
              validTo: VALID_TO_HALF_HOUR,
            });
            const calculatedOrderId = await calculateUniqueOrderId(state.chainId, unsignerOrder);

            await uploadAppData(
              calculatedOrderId,
              stringify(
                COW_APP_DATA(
                  state.sourceToken.symbol,
                  state.destinationToken.symbol,
                  slippageBps,
                  smartSlippage,
                  state.orderType,
                  APP_CODE_PER_SWAP_TYPE[params.swapType]
                )
              ),
              state.chainId
            );

            // CoW takes some time to index the order for 'eth-flow' orders
            setTimeout(() => {
              setMainTxState({
                loading: false,
                success: true,
                txHash: calculatedOrderId,
              });
            }, 1000 * 30); // 30 seconds - if we set less than 30 seconds, the order is not indexed yet and CoW explorer will not find the order
          } catch (error) {
            setTxError(getErrorTextFromError(error, TxAction.MAIN_ACTION, false));
            setMainTxState({
              txHash: response?.hash,
              loading: false,
            });
            setState({
              actionsLoading: false,
            });
            if (response?.hash) {
              addTransaction(
                response?.hash,
                {
                  txState: 'failed',
                },
                { chainId: state.chainId }
              );
            }
          }
        } else {
          let orderId;
          try {
            if (await isSmartContractWallet(user, provider)) {
              const preSignTransaction = await getPreSignTransaction({
                provider,
                tokenDest: state.destinationToken.addressToSwap,
                chainId: state.chainId,
                user,
                sellAmount: sellAmountAccountingCosts,
                buyAmount: buyAmountAccountingCosts,
                tokenSrc: state.sourceToken.addressToSwap,
                tokenSrcDecimals: state.swapRate.srcDecimals,
                tokenDestDecimals: state.swapRate.destDecimals,
                slippageBps,
                smartSlippage,
                inputSymbol: state.sourceToken.symbol,
                outputSymbol: state.destinationToken.symbol,
                quote: state.swapRate.order,
                appCode,
                orderBookQuote: state.swapRate.orderBookQuote,
                orderType: state.orderType,
                kind:
                  state.orderType === OrderType.MARKET
                    ? OrderKind.SELL
                    : state.side === 'buy'
                    ? OrderKind.BUY
                    : OrderKind.SELL,
              });

              const response = await sendTx({
                data: preSignTransaction.data,
                to: preSignTransaction.to,
                value: BigNumber.from(preSignTransaction.value),
                gasLimit: BigNumber.from(preSignTransaction.gasLimit),
              });

              addTransaction(
                response.hash,
                {
                  txState: 'success',
                },
                {
                  chainId: state.chainId,
                }
              );

              setMainTxState({
                loading: false,
                success: true,
                txHash: preSignTransaction.orderId,
              });
            } else {
              orderId = await sendOrder({
                tokenSrc: state.sourceToken.addressToSwap,
                tokenSrcDecimals: state.swapRate.srcDecimals,
                tokenDest: state.destinationToken.addressToSwap,
                tokenDestDecimals: state.swapRate.destDecimals,
                quote: state.swapRate.order,
                sellAmount: sellAmountAccountingCosts,
                buyAmount: buyAmountAccountingCosts,
                slippageBps,
                smartSlippage,
                orderType: state.orderType,
                kind:
                  state.orderType === OrderType.MARKET
                    ? OrderKind.SELL
                    : state.side === 'buy'
                    ? OrderKind.BUY
                    : OrderKind.SELL,
                chainId: state.chainId,
                user,
                provider,
                inputSymbol: state.sourceToken.symbol,
                outputSymbol: state.destinationToken.symbol,
                appCode,
                orderBookQuote: state.swapRate.orderBookQuote,
              });
              setMainTxState({
                loading: false,
                success: true,
                txHash: orderId ?? undefined,
              });
            }
          } catch (error) {
            console.error('SwapActionsViaCoW error', error);
            const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
            setTxError(parsedError);
            setMainTxState({
              success: false,
              loading: false,
            });
            setState({
              actionsLoading: false,
            });
          }
        }
      } catch (error) {
        console.error(error);
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
          success: false,
        });
        setState({
          actionsLoading: false,
        });
      }
    } else {
      setTxError(
        getErrorTextFromError(new Error('No sell rates found'), TxAction.MAIN_ACTION, true)
      );
      setState({
        actionsLoading: false,
      });
    }

    trackingHandlers.trackSwap();
    params.invalidateAppState();
  };

  // Track execution state to pause rate updates during actions
  useEffect(() => {
    const isExecuting = mainTxState.loading || approvalTxState.loading;
    setState({ actionsLoading: isExecuting });
  }, [mainTxState.loading, approvalTxState.loading, setState, state.actionsLoading]);

  return (
    <TxActionsWrapper
      sx={{
        mt: 6,
      }}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={state.isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={state.inputAmount}
      handleApproval={() => approval()}
      requiresApproval={!state.actionsBlocked && requiresApproval}
      actionText={<Trans>Swap</Trans>}
      actionInProgressText={<Trans>Swapping</Trans>}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked || (!approvalTxState.success && requiresApproval),
        content: <Trans>Swap</Trans>,
        handleClick: action,
      }}
      fetchingData={state.actionsLoading}
      blocked={state.actionsBlocked}
      tryPermit={tryPermit}
    />
  );
};
