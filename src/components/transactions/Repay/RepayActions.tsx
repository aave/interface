import {
  ApproveType,
  gasLimitRecommendations,
  InterestRate,
  MAX_UINT_AMOUNT,
  ProtocolAction,
} from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import { queryClient } from 'pages/_app.page';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { QueryKeys } from 'src/ui-config/queries';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';

interface SignedParams {
  signature: SignatureLike;
  deadline: string;
  amount: string;
}

export interface RepayActionProps extends BoxProps {
  amountToRepay: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  customGasPrice?: string;
  poolAddress: string;
  symbol: string;
  debtType: InterestRate;
  repayWithATokens: boolean;
  blocked?: boolean;
}

export const RepayActions = ({
  amountToRepay,
  poolReserve,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  debtType,
  repayWithATokens,
  blocked,
  ...props
}: RepayActionProps) => {
  const {
    repay,
    repayWithPermit,
    tryPermit,
    getApprovedAmount,
    walletApprovalMethodPreference,
    generateSignatureRequest,
    generateApproval,
    estimateGasLimit,
    addTransaction,
  } = useRootStore();
  const { signTxData, sendTx } = useWeb3Context();
  const { refetchGhoData, refetchIncentiveData, refetchPoolData } = useBackgroundDataProvider();
  const [approvedAmount, setApprovedAmount] = useState<ApproveType | undefined>();
  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
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

  const permitAvailable = tryPermit(poolAddress);
  console.log(permitAvailable);
  const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const requiresApproval = useMemo(() => {
    return checkRequiresApproval({
      approvedAmount: approvedAmount?.amount || '0',
      amount: amountToRepay,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });
  }, [amountToRepay, signatureParams, approvedAmount]);

  const fetchApprovedAmount = useCallback(async () => {
    setLoadingTxns(true);
    const approvedAmountPool = await getApprovedAmount({ token: poolAddress });
    setApprovedAmount(approvedAmountPool);
    setLoadingTxns(false);
  }, [setLoadingTxns, getApprovedAmount, poolAddress]);

  const approval = async () => {
    try {
      if (approvedAmount) {
        if (usePermit) {
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const signatureRequest = await generateSignatureRequest({
            ...approvedAmount,
            deadline,
            amount: parseUnits(amountToRepay, poolReserve.decimals).toString(),
          });

          const response = await signTxData(signatureRequest);
          setSignatureParams({ signature: response, deadline, amount: amountToRepay });
          setApprovalTxState({
            txHash: MOCK_SIGNED_HASH,
            loading: false,
            success: true,
          });
        } else {
          let approveTxData = generateApproval(approvedAmount);
          setApprovalTxState({ ...approvalTxState, loading: true });
          approveTxData = await estimateGasLimit(approveTxData);
          const response = await sendTx(approveTxData);
          await response.wait(1);
          setApprovalTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          addTransaction(response.hash, {
            action: ProtocolAction.approval,
            txState: 'success',
            asset: poolAddress,
            amount: MAX_UINT_AMOUNT,
            assetName: symbol,
          });
        }
      }
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      let response: TransactionResponse;
      let action = ProtocolAction.default;

      if (usePermit && signatureParams) {
        action = ProtocolAction.repayWithPermit;
        let signedSupplyWithPermitTxData = repayWithPermit({
          amountToRepay: parseUnits(amountToRepay, poolReserve.decimals).toString(),
          poolReserve,
          isWrongNetwork,
          poolAddress,
          symbol,
          debtType,
          repayWithATokens,
          signature: signatureParams.signature,
          deadline: signatureParams.deadline,
        });

        signedSupplyWithPermitTxData = await estimateGasLimit(signedSupplyWithPermitTxData);
        response = await sendTx(signedSupplyWithPermitTxData);
        await response.wait(1);
      } else {
        action = ProtocolAction.repay;
        let supplyTxData = repay({
          amountToRepay: parseUnits(amountToRepay, poolReserve.decimals).toString(),
          poolAddress,
          repayWithATokens,
          debtType,
          poolReserve,
          isWrongNetwork,
          symbol,
        });
        supplyTxData = await estimateGasLimit(supplyTxData);
        response = await sendTx(supplyTxData);
        await response.wait(1);
      }
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
      addTransaction(response.hash, {
        action,
        txState: 'success',
        asset: poolAddress,
        amount: amountToRepay,
        assetName: symbol,
      });

      queryClient.invalidateQueries({ queryKey: [QueryKeys.POOL_TOKENS] });
      refetchPoolData && refetchPoolData();
      refetchIncentiveData && refetchIncentiveData();
      refetchGhoData && refetchGhoData();
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchApprovedAmount();
  }, [fetchApprovedAmount]);

  useEffect(() => {
    let supplyGasLimit = 0;
    if (usePermit) {
      supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supplyWithPermit].recommended);
    } else {
      supplyGasLimit = Number(gasLimitRecommendations[ProtocolAction.supply].recommended);
      if (requiresApproval && !approvalTxState.success) {
        supplyGasLimit += Number(APPROVAL_GAS_LIMIT);
      }
    }
    setGasLimit(supplyGasLimit.toString());
  }, [requiresApproval, approvalTxState, usePermit, setGasLimit]);

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      symbol={poolReserve.symbol}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={amountToRepay}
      requiresApproval={requiresApproval}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
      handleAction={action}
      handleApproval={approval}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
      tryPermit={permitAvailable}
    />
  );
};
