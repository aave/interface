import { ERC20Service, gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import {
  calculateUniqueOrderId,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  OrderClass,
  SupportedChainId,
} from '@cowprotocol/cow-sdk';
import { Trans } from '@lingui/macro';
import { BigNumber, ethers } from 'ethers';
import stringify from 'json-stringify-deterministic';
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { APPROVAL_GAS_LIMIT } from 'src/components/transactions/utils';
import { isSmartContractWallet } from 'src/helpers/provider';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';
import { needsUSDTApprovalReset } from 'src/utils/usdtHelpers';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { COW_APP_DATA } from '../../constants/cow.constants';
import { APP_CODE_PER_SWAP_TYPE } from '../../constants/shared.constants';
import {
  getPreSignTransaction,
  getUnsignerOrder,
  isNativeToken,
  populateEthFlowTx,
  sendOrder,
  uploadAppData,
} from '../../helpers/cow';
import { isCowProtocolRates, SwapParams, SwapState, SwapType } from '../../types';

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
  const [user, generateApproval, estimateGasLimit, addTransaction, currentMarketData] =
    useRootStore(
      useShallow((state) => [
        state.account,
        state.generateApproval,
        state.estimateGasLimit,
        state.addTransaction,
        state.currentMarketData,
      ])
    );

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setMainTxState,
    setTxError,
    setGasLimit,
    setLoadingTxns,
    setApprovalTxState,
  } = useModalContext();

  const { sendTx } = useWeb3Context();

  const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);

  const requiresApproval = useMemo(() => {
    if (
      approvedAmount === undefined ||
      approvedAmount === -1 ||
      state.inputAmount === '0' ||
      state.isWrongNetwork
    )
      return false;
    else return approvedAmount < Number(state.inputAmount);
  }, [approvedAmount, state.inputAmount, state.isWrongNetwork]);

  // Warning for USDT on Ethereum approval reset
  useEffect(() => {
    if (!state.swapRate || params.swapType !== SwapType.Swap) {
      return;
    }

    const amountToApprove = calculateSignedAmount(state.inputAmount, state.swapRate.srcDecimals, 0);
    const currentApproved = calculateSignedAmount(
      approvedAmount?.toString() || '0',
      state.swapRate.srcDecimals,
      0
    );

    if (
      needsUSDTApprovalReset(
        state.sourceToken.symbol,
        state.chainId,
        currentApproved,
        amountToApprove
      )
    ) {
      setState({ ...state, showUSDTResetWarning: true });
      setState({ ...state, requiresApprovalReset: true });
    } else {
      setState({ ...state, showUSDTResetWarning: false });
      setState({ ...state, requiresApprovalReset: false });
    }
  }, [
    state.sourceToken.symbol,
    state.chainId,
    approvedAmount,
    state.inputAmount,
    setState,
    state.swapRate,
  ]);

  const slippageInPercent = state.slippage;

  const action = async () => {
    setMainTxState({ ...mainTxState, loading: true });
    if (isCowProtocolRates(state.swapRate)) {
      if (state.useFlashloan) {
        setTxError(
          getErrorTextFromError(new Error('Please use flashloan'), TxAction.MAIN_ACTION, true)
        );
        setMainTxState({
          txHash: undefined,
          loading: false,
        });
        return;
      }

      try {
        const provider = await getEthersProvider(wagmiConfig, { chainId: state.chainId });
        const destAmountWithSlippage = valueToBigNumber(state.swapRate.destAmount)
          .multipliedBy(
            valueToBigNumber(1).minus(valueToBigNumber(slippageInPercent).dividedBy(100))
          )
          .toFixed(0);
        const slippageBps = Math.round(Number(slippageInPercent) * 100); // percent to bps
        const smartSlippage = state.swapRate.suggestedSlippage == Number(slippageInPercent);
        const appCode = APP_CODE_PER_SWAP_TYPE[params.swapType];

        // If srcToken is native, we need to use the eth-flow instead of the orderbook
        if (isNativeToken(state.sourceToken.addressToSwap)) {
          const validTo = Math.floor(Date.now() / 1000) + 60 * 30; // 30 minutes
          const ethFlowTx = await populateEthFlowTx(
            state.swapRate.srcAmount,
            destAmountWithSlippage.toString(),
            state.destinationToken.addressToSwap,
            user,
            validTo,
            state.sourceToken.symbol,
            state.destinationToken.symbol,
            slippageBps,
            smartSlippage,
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

            const unsignerOrder = await getUnsignerOrder(
              state.swapRate.srcAmount,
              destAmountWithSlippage.toString(),
              state.destinationToken.addressToSwap,
              user,
              state.chainId,
              state.sourceToken.symbol,
              state.destinationToken.symbol,
              slippageBps,
              smartSlippage
            );
            const calculatedOrderId = await calculateUniqueOrderId(state.chainId, unsignerOrder);

            await uploadAppData(
              calculatedOrderId,
              stringify(
                COW_APP_DATA(
                  state.sourceToken.symbol,
                  state.destinationToken.symbol,
                  slippageBps,
                  smartSlippage,
                  OrderClass.MARKET
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
                amount: state.swapRate.srcAmount,
                tokenSrc: state.sourceToken.addressToSwap,
                tokenSrcDecimals: state.swapRate.srcDecimals,
                tokenDestDecimals: state.swapRate.destDecimals,
                afterNetworkCostsBuyAmount:
                  state.swapRate.amountAndCosts.afterNetworkCosts.buyAmount.toString(),
                slippageBps,
                smartSlippage,
                inputSymbol: state.sourceToken.symbol,
                outputSymbol: state.destinationToken.symbol,
                quote: state.swapRate.order,
                appCode,
                orderBookQuote: state.swapRate.orderBookQuote,
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
                amount: state.swapRate.srcAmount,
                afterNetworkCostsBuyAmount:
                  state.swapRate.amountAndCosts.afterNetworkCosts.buyAmount.toString(),
                slippageBps,
                smartSlippage,
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
            console.error(error);
            const parsedError = getErrorTextFromError(error, TxAction.MAIN_ACTION, false);
            setTxError(parsedError);
            setMainTxState({
              success: false,
              loading: false,
            });
          }
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setMainTxState({
          txHash: undefined,
          loading: false,
          success: false,
        });
      }
    } else {
      setTxError(
        getErrorTextFromError(new Error('No sell rates found'), TxAction.MAIN_ACTION, true)
      );
    }

    trackingHandlers.trackSwap();
    params.invalidateAppState();
  };

  const approval = async () => {
    let spender;
    if (isCowProtocolRates(state.swapRate)) {
      spender = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[state.chainId as SupportedChainId];
    } else {
      // Error
      const parsedError = getErrorTextFromError(
        new Error('Invalid swap provider rates.'),
        TxAction.APPROVAL,
        false
      );

      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
      return;
    }

    // Ensure spender is defined
    if (!spender) {
      const parsedError = getErrorTextFromError(
        new Error('Unable to determine spender address for approval.'),
        TxAction.APPROVAL,
        false
      );

      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
      return;
    }

    const amountToApprove = calculateSignedAmount(state.inputAmount, state.swapRate.srcDecimals, 0);

    if (state.requiresApprovalReset) {
      try {
        // CoW does not support permit
        // Create direct ERC20 approval transaction for reset to 0 as ERC20Service requires positive amount
        const abi = new ethers.utils.Interface([
          'function approve(address spender, uint256 amount)',
        ]);
        const encodedData = abi.encodeFunctionData('approve', [spender, '0']);
        const resetTx = {
          data: encodedData,
          to: state.sourceToken.addressToSwap,
          from: user,
        };
        const resetTxWithGasEstimation = await estimateGasLimit(resetTx, state.chainId);
        setApprovalTxState({ ...approvalTxState, loading: true });
        const resetResponse = await sendTx(resetTxWithGasEstimation);
        await resetResponse.wait(1);
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
        console.error(parsedError);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
      fetchApprovedAmount().then(() => {
        setApprovalTxState({
          loading: false,
          success: false,
        });
      });

      return;
    }

    const approvalData = {
      spender,
      user,
      token: state.sourceToken.addressToSwap,
      amount: amountToApprove,
    };
    try {
      // CoW does not support permit
      const tx = generateApproval(approvalData, {
        chainId: state.chainId,
        amount: amountToApprove,
      });
      const txWithGasEstimation = await estimateGasLimit(tx, state.chainId);
      setApprovalTxState({ loading: true });
      const response = await sendTx(txWithGasEstimation);
      await response.wait(1);
      fetchApprovedAmount().then(() => {
        setApprovalTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });
        setTxError(undefined);
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
      console.error(parsedError);
      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const fetchApprovedAmount = useCallback(async () => {
    if (isCowProtocolRates(state.swapRate)) {
      // Check approval to VaultRelayer
      setApprovalTxState({
        txHash: undefined,
        loading: false,
        success: false,
      });
      setLoadingTxns(true);
      const rpc = getProvider(state.chainId);
      const erc20Service = new ERC20Service(rpc);
      const approvedTargetAmount = await erc20Service.approvedAmount({
        user,
        token: state.sourceToken.addressToSwap,
        spender: COW_PROTOCOL_VAULT_RELAYER_ADDRESS[state.chainId as SupportedChainId],
      });
      setApprovedAmount(approvedTargetAmount);
      setLoadingTxns(false);
    }
  }, [
    state.chainId,
    setLoadingTxns,
    user,
    state.sourceToken.addressToSwap,
    state.swapRate,
    setApprovalTxState,
    state.useFlashloan,
    params.swapType,
    currentMarketData,
  ]);

  useEffect(() => {
    if (user) {
      fetchApprovedAmount();
    }
  }, [fetchApprovedAmount, user]);

  // Track execution state to pause rate updates during actions
  useEffect(() => {
    const isExecuting = mainTxState.loading || approvalTxState.loading || loadingTxns;

    setState({ ...state, actionsLoading: isExecuting });
  }, [mainTxState.loading, approvalTxState.loading, loadingTxns, setState, state.actionsLoading]);

  useEffect(() => {
    let switchGasLimit = 0;
    if (requiresApproval && !approvalTxState.success) {
      switchGasLimit += Number(APPROVAL_GAS_LIMIT);
      if (state.requiresApprovalReset) {
        switchGasLimit += Number(APPROVAL_GAS_LIMIT); // Reset approval
      }
    }
    if (isNativeToken(state.sourceToken.addressToSwap)) {
      switchGasLimit += Number(
        gasLimitRecommendations[ProtocolAction.withdrawAndSwitch].recommended
      );
    }
    setState({ ...state, gasLimit: switchGasLimit.toString() });
    setState({
      ...state,
      showGasStation: requiresApproval || isNativeToken(state.sourceToken.addressToSwap),
    });
  }, [requiresApproval, approvalTxState, setGasLimit, setState, state.requiresApprovalReset]);

  return (
    <TxActionsWrapper
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
      tryPermit={false}
    />
  );
};
