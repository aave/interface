import { ERC20Service } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { calculateSignedAmount, SwapTransactionParams } from 'src/hooks/paraswap/common';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

import { TxActionsWrapper } from '../TxActionsWrapper';

interface WithdrawAndSwapProps extends BoxProps {
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

export interface WithdrawAndSwapActionProps
  extends Pick<
    WithdrawAndSwapProps,
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

export const WithdrawAndSwapActions = ({
  amountToSwap,
  amountToReceive,
  isWrongNetwork,
  sx,
  poolReserve,
  targetReserve,
  isMaxSelected,
  loading,
  blocked,
  buildTxFn,
}: WithdrawAndSwapProps) => {
  const [
    withdrawAndSwap,
    currentMarketData,
    jsonRpcProvider,
    account,
    generateApproval,
    estimateGasLimit,
    walletApprovalMethodPreference,
    generateSignatureRequest,
  ] = useRootStore((state) => [
    state.withdrawAndSwap,
    state.currentMarketData,
    state.jsonRpcProvider,
    state.account,
    state.generateApproval,
    state.estimateGasLimit,
    state.walletApprovalMethodPreference,
    state.generateSignatureRequest,
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

  console.log(setGasLimit);
  console.log(amountToReceive);

  const { sendTx, signTxData } = useWeb3Context();

  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

  const requiresApproval = useMemo(() => {
    return approvedAmount <= Number(amountToSwap);
  }, [approvedAmount, amountToSwap]);

  const useSignature = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const route = await buildTxFn();
      const tx = withdrawAndSwap({
        poolReserve,
        targetReserve,
        isMaxSelected,
        amountToSwap: parseUnits(route.inputAmount, targetReserve.decimals).toString(),
        amountToReceive: parseUnits(route.outputAmount, poolReserve.decimals).toString(),
        augustus: route.augustus,
        txCalldata: route.swapCallData,
        signatureParams,
      });
      const txDataWithGasEstimation = await estimateGasLimit(tx);
      const response = await sendTx(txDataWithGasEstimation);
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
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
      spender: currentMarketData.addresses.WITHDRAW_AND_SWAP_ADAPTER || '',
      amount: amountToApprove,
    };
    try {
      if (useSignature) {
        const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
        const signatureRequest = await generateSignatureRequest({
          ...approvalData,
          deadline,
        });
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
        spender: currentMarketData.addresses.WITHDRAW_AND_SWAP_ADAPTER || '',
      });
      setApprovedAmount(approvedTargetAmount);
      setLoadingTxns(false);
    },
    [
      jsonRpcProvider,
      account,
      currentMarketData.addresses.WITHDRAW_AND_SWAP_ADAPTER,
      setLoadingTxns,
    ]
  );

  useEffect(() => {
    fetchApprovedAmount(poolReserve.aTokenAddress);
  }, [fetchApprovedAmount, poolReserve.aTokenAddress]);

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
