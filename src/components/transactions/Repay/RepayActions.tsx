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
import { useCallback, useEffect, useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

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

  const [requiresApproval, setRequiresApproval] = useState(false);
  const permitAvailable = tryPermit(poolAddress);
  const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const fetchApprovedAmount = useCallback(
    async (forceApprovalCheck?: boolean) => {
      // Check approved amount on-chain on first load or if an action triggers a re-check such as an approval being confirmed
      if (!approvedAmount || forceApprovalCheck) {
        setLoadingTxns(true);
        const approvedAmount = await getApprovedAmount({ token: poolAddress });
        setApprovedAmount(approvedAmount);
      }

      if (approvedAmount) {
        const fetchedRequiresApproval = checkRequiresApproval({
          approvedAmount: approvedAmount.amount,
          amount: amountToRepay,
          signedAmount: signatureParams ? signatureParams.amount : '0',
        });
        setRequiresApproval(fetchedRequiresApproval);
        if (fetchedRequiresApproval) setApprovalTxState({});
      }

      setLoadingTxns(false);
    },
    [
      approvedAmount,
      setLoadingTxns,
      getApprovedAmount,
      poolAddress,
      amountToRepay,
      signatureParams,
      setApprovalTxState,
    ]
  );

  const approval = async () => {
    try {
      if (requiresApproval && approvedAmount) {
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
          fetchApprovedAmount(true);
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

      // determine if approval is signature or transaction
      // checking user preference is not sufficient because permit may be available but the user has an existing approval
      if (usePermit && signatureParams) {
        action = ProtocolAction.supplyWithPermit;
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
        action = ProtocolAction.supply;
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
  }, [fetchApprovedAmount, poolAddress]);

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
      handleApproval={() => approval([{ amount: amountToRepay, underlyingAsset: poolAddress }])}
      actionText={<Trans>Repay {symbol}</Trans>}
      actionInProgressText={<Trans>Repaying {symbol}</Trans>}
      tryPermit={permitAvailable}
    />
  );
};
