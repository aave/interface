import { ERC20Service, gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import { queryClient } from 'pages/_app.page';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { calculateSignedAmount, SwapTransactionParams } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { QueryKeys } from 'src/ui-config/queries';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT } from '../utils';

interface WithdrawAndSwitchProps extends BoxProps {
  amountToSwap: string;
  amountToReceive: string;
  poolReserve: ComputedReserveData;
  targetReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  blocked: boolean;
  isMaxSelected: boolean;
  loading?: boolean;
  buildTxFn: () => Promise<SwapTransactionParams>;
}

export interface WithdrawAndSwitchActionProps
  extends Pick<
    WithdrawAndSwitchProps,
    'amountToSwap' | 'amountToReceive' | 'poolReserve' | 'targetReserve' | 'isMaxSelected'
  > {
  augustus: string;
  signatureParams?: SignedParams;
  txCalldata: string;
}

interface SignedParams {
  signature: SignatureLike;
  deadline: string;
  amount: string;
}

export const WithdrawAndSwitchActions = ({
  amountToSwap,
  isWrongNetwork,
  sx,
  poolReserve,
  targetReserve,
  isMaxSelected,
  loading,
  blocked,
  buildTxFn,
}: WithdrawAndSwitchProps) => {
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
  ] = useRootStore((state) => [
    state.withdrawAndSwitch,
    state.currentMarketData,
    state.jsonRpcProvider,
    state.account,
    state.generateApproval,
    state.estimateGasLimit,
    state.walletApprovalMethodPreference,
    state.generateSignatureRequest,
    state.addTransaction,
  ]);
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

  const { sendTx, signTxData } = useWeb3Context();

  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
  const { refetchPoolData, refetchIncentiveData, refetchGhoData } = useBackgroundDataProvider();

  const requiresApproval = useMemo(() => {
    return approvedAmount <= Number(amountToSwap);
  }, [approvedAmount, amountToSwap]);

  const useSignature = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const route = await buildTxFn();
      const tx = withdrawAndSwitch({
        poolReserve,
        targetReserve,
        isMaxSelected,
        amountToSwap: parseUnits(route.inputAmount, poolReserve.decimals).toString(),
        amountToReceive: parseUnits(route.outputAmount, targetReserve.decimals).toString(),
        augustus: route.augustus,
        txCalldata: route.swapCallData,
        signatureParams,
      });
      const txDataWithGasEstimation = await estimateGasLimit(tx);
      const response = await sendTx(txDataWithGasEstimation);
      await response.wait(1);
      queryClient.invalidateQueries({ queryKey: [QueryKeys.POOL_TOKENS] });
      refetchGhoData && refetchGhoData();
      refetchPoolData && refetchPoolData();
      refetchIncentiveData && refetchIncentiveData();
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
      addTransaction(response.hash, {
        action: ProtocolAction.withdrawAndSwitch,
        txState: 'success',
        asset: poolReserve.underlyingAsset,
        amount: parseUnits(route.inputAmount, poolReserve.decimals).toString(),
        assetName: poolReserve.name,
        outAsset: targetReserve.underlyingAsset,
        outAssetName: targetReserve.name,
        outAmount: parseUnits(route.outputAmount, targetReserve.decimals).toString(),
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const approval = async () => {
    const amountToApprove = calculateSignedAmount(amountToSwap, poolReserve.decimals);
    const approvalData = {
      user: account,
      token: poolReserve.aTokenAddress,
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
          asset: poolReserve.aTokenAddress,
          amount: parseUnits(amountToApprove, poolReserve.decimals).toString(),
          assetName: `a${poolReserve.symbol}`,
          spender: currentMarketData.addresses.WITHDRAW_SWITCH_ADAPTER,
        });
        setTxError(undefined);
        fetchApprovedAmount(poolReserve.aTokenAddress);
      }
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      if (!approvalTxState.success) {
        setApprovalTxState({
          txHash: undefined,
          loading: false,
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
    },
    [jsonRpcProvider, account, currentMarketData.addresses.WITHDRAW_SWITCH_ADAPTER, setLoadingTxns]
  );

  useEffect(() => {
    fetchApprovedAmount(poolReserve.aTokenAddress);
  }, [fetchApprovedAmount, poolReserve.aTokenAddress]);

  useEffect(() => {
    let switchGasLimit = 0;
    switchGasLimit = Number(gasLimitRecommendations[ProtocolAction.withdrawAndSwitch].recommended);
    if (requiresApproval && !approvalTxState.success) {
      switchGasLimit += Number(APPROVAL_GAS_LIMIT);
    }
    setGasLimit(switchGasLimit.toString());
  }, [requiresApproval, approvalTxState, setGasLimit]);

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={amountToSwap}
      handleApproval={() => approval()}
      requiresApproval={requiresApproval}
      actionText={<Trans>Withdraw and Switch</Trans>}
      actionInProgressText={<Trans>Withdrawing and Switching</Trans>}
      sx={sx}
      errorParams={{
        loading: false,
        disabled: blocked || !approvalTxState?.success,
        content: <Trans>Withdraw and Switch</Trans>,
        handleClick: action,
      }}
      fetchingData={loading}
      blocked={blocked}
      tryPermit={true}
    />
  );
};
