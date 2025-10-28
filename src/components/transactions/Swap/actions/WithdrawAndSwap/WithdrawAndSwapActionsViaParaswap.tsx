import { ERC20Service, ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { SignatureLike } from '@ethersproject/bytes';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'ethers/lib/utils';
import { Dispatch, useCallback, useEffect, useMemo, useState } from 'react';
import { TxActionsWrapper } from 'src/components/transactions/TxActionsWrapper';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { calculateSignedAmount } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useShallow } from 'zustand/shallow';

import { TrackAnalyticsHandlers } from '../../analytics/useTrackAnalytics';
import { getTransactionParams } from '../../helpers/paraswap';
import { useSwapGasEstimation } from '../../hooks/useSwapGasEstimation';
import { isParaswapRates, ProtocolSwapParams, ProtocolSwapState, SwapState } from '../../types';

interface SignedParams {
  signature: SignatureLike;
  deadline: string;
  amount: string;
}

export const WithdrawAndSwapActionsViaParaswap = ({
  state,
  setState,
  trackingHandlers,
}: {
  params: ProtocolSwapParams;
  state: ProtocolSwapState;
  setState: Dispatch<Partial<SwapState>>;
  trackingHandlers: TrackAnalyticsHandlers;
}) => {
  const [
    withdrawAndSwitch,
    currentMarketData,
    jsonRpcProvider,
    account,
    generateApproval,
    estimateGasLimit,
    walletApprovalMethodPreference,
    generateSignatureRequest,
    addTransaction,
  ] = useRootStore(
    useShallow((state) => [
      state.withdrawAndSwitch,
      state.currentMarketData,
      state.jsonRpcProvider,
      state.account,
      state.generateApproval,
      state.estimateGasLimit,
      state.walletApprovalMethodPreference,
      state.generateSignatureRequest,
      state.addTransaction,
    ])
  );

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setMainTxState,
    setTxError,
    setLoadingTxns,
    setApprovalTxState,
  } = useModalContext();

  const { sendTx, signTxData } = useWeb3Context();
  const queryClient = useQueryClient();

  const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);
  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

  const requiresApproval = useMemo(() => {
    if (
      approvedAmount === undefined ||
      approvedAmount === -1 ||
      state.inputAmount === '0' ||
      state.isWrongNetwork
    )
      return false;
    else return approvedAmount <= Number(state.inputAmount);
  }, [approvedAmount, state.inputAmount, state.isWrongNetwork]);

  // Use centralized gas estimation
  useSwapGasEstimation({
    state,
    setState,
    requiresApproval,
    requiresApprovalReset: state.requiresApprovalReset,
    approvalTxState,
  });

  const useSignature = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const action = async () => {
    if (!state.swapRate || !isParaswapRates(state.swapRate)) {
      console.error('No swap rate found');
      return;
    }

    try {
      setMainTxState({ ...mainTxState, loading: true });
      const { swapCallData, augustus } = await getTransactionParams(
        state.side,
        state.chainId,
        state.sourceToken.addressToSwap,
        state.sourceToken.decimals,
        state.destinationToken.addressToSwap,
        state.destinationToken.decimals,
        state.user,
        state.swapRate.optimalRateData,
        Number(state.slippage)
      );

      // TODO: Fix this not working the tx builder via paraswap

      const tx = withdrawAndSwitch({
        poolReserve: state.sourceReserve.reserve,
        targetReserve: state.destinationReserve.reserve,
        isMaxSelected: state.isMaxSelected,
        amountToSwap: parseUnits(
          state.inputAmount,
          state.sourceReserve.reserve.decimals
        ).toString(),
        amountToReceive: parseUnits(
          state.buyAmountFormatted ?? '0',
          state.destinationReserve.reserve.decimals
        ).toString(),
        augustus: augustus,
        txCalldata: swapCallData,
        signatureParams,
      });
      const txDataWithGasEstimation = await estimateGasLimit(tx);
      const response = await sendTx(txDataWithGasEstimation);
      await response.wait(1);
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.gho });
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
      addTransaction(response.hash, {
        action: ProtocolAction.withdrawAndSwitch,
        txState: 'success',
        asset: state.sourceReserve.reserve.underlyingAsset,
        amount: parseUnits(state.inputAmount, state.sourceReserve.reserve.decimals).toString(),
        assetName: state.sourceReserve.reserve.name,
        outAsset: state.destinationReserve.reserve.underlyingAsset,
        outAssetName: state.destinationReserve.reserve.name,
        outAmount: parseUnits(
          state.buyAmountFormatted ?? '0',
          state.destinationReserve.reserve.decimals
        ).toString(),
        amountUsd: valueToBigNumber(
          parseUnits(state.inputAmount, state.sourceReserve.reserve.decimals).toString()
        )
          .multipliedBy(state.sourceReserve.reserve.priceInUSD)
          .toString(),
        outAmountUsd: valueToBigNumber(
          parseUnits(
            state.buyAmountFormatted ?? '0',
            state.destinationReserve.reserve.decimals
          ).toString()
        )
          .multipliedBy(state.destinationReserve.reserve.priceInUSD)
          .toString(),
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
      setState({
        actionsLoading: false,
      });
      trackingHandlers.trackSwapFailed();
    }
  };

  const approval = async () => {
    const amountToApprove = calculateSignedAmount(
      state.inputAmount,
      state.sourceReserve.reserve.decimals
    );
    const approvalData = {
      user: account,
      token: state.sourceReserve.reserve.aTokenAddress,
      spender: currentMarketData.addresses.WITHDRAW_SWITCH_ADAPTER || '',
      amount: amountToApprove,
    };
    try {
      if (useSignature) {
        const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
        const signatureRequest = await generateSignatureRequest({
          ...approvalData,
          deadline,
        });
        setApprovalTxState({ ...approvalTxState, loading: true });
        const response = await signTxData(signatureRequest);
        setSignatureParams({ signature: response, deadline, amount: amountToApprove });
        setApprovalTxState({
          txHash: MOCK_SIGNED_HASH,
          loading: false,
          success: true,
        });
      } else {
        const tx = generateApproval(approvalData);
        const txWithGasEstimation = await estimateGasLimit(tx);
        setApprovalTxState({ ...approvalTxState, loading: true });
        const response = await sendTx(txWithGasEstimation);
        await response.wait(1);
        setApprovalTxState({
          txHash: response.hash,
          loading: false,
          success: true,
        });
        addTransaction(response.hash, {
          action: ProtocolAction.withdrawAndSwitch,
          txState: 'success',
          asset: state.sourceReserve.reserve.aTokenAddress,
          amount: parseUnits(amountToApprove, state.sourceReserve.reserve.decimals).toString(),
          assetName: `a${state.sourceReserve.reserve.symbol}`,
          spender: currentMarketData.addresses.WITHDRAW_SWITCH_ADAPTER,
        });
        setTxError(undefined);
        fetchApprovedAmount(state.sourceReserve.reserve.aTokenAddress);
      }
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      if (!approvalTxState.success) {
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
        setState({
          actionsLoading: false,
        });
      }
    }
  };

  const fetchApprovedAmount = useCallback(
    async (aTokenAddress: string) => {
      setLoadingTxns(true);
      const rpc = jsonRpcProvider();
      const erc20Service = new ERC20Service(rpc);
      const approvedTargetAmount = await erc20Service.approvedAmount({
        user: account,
        token: aTokenAddress,
        spender: currentMarketData.addresses.WITHDRAW_SWITCH_ADAPTER || '',
      });
      setApprovedAmount(approvedTargetAmount);
      setLoadingTxns(false);
      setState({
        actionsLoading: false,
      });
    },
    [jsonRpcProvider, account, currentMarketData.addresses.WITHDRAW_SWITCH_ADAPTER, setLoadingTxns]
  );

  useEffect(() => {
    fetchApprovedAmount(state.sourceReserve.reserve.aTokenAddress);
  }, [fetchApprovedAmount, state.sourceReserve.reserve.aTokenAddress]);

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
      requiresApproval={requiresApproval}
      actionText={<Trans>Withdraw and Switch</Trans>}
      actionInProgressText={<Trans>Withdrawing and Switching</Trans>}
      //   sx={sx}
      errorParams={{
        loading: false,
        disabled: state.actionsBlocked || !approvalTxState?.success,
        content: <Trans>Withdraw and Switch</Trans>,
        handleClick: action,
      }}
      fetchingData={state.ratesLoading}
      blocked={state.actionsBlocked}
      tryPermit={true}
    />
  );
};
