import { gasLimitRecommendations, InterestRate, ProtocolAction } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { usePoolApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';

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
  maxApproveNeeded: string;
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
  maxApproveNeeded,
  ...props
}: RepayActionProps) => {
  const [
    repay,
    repayWithPermit,
    encodeRepayParams,
    encodeRepayWithPermit,
    tryPermit,
    walletApprovalMethodPreference,
    estimateGasLimit,
    addTransaction,
    optimizedPath,
    currentMarketData,
  ] = useRootStore((store) => [
    store.repay,
    store.repayWithPermit,
    store.encodeRepayParams,
    store.encodeRepayWithPermitParams,
    store.tryPermit,
    store.walletApprovalMethodPreference,
    store.estimateGasLimit,
    store.addTransaction,
    store.useOptimizedPath,
    store.currentMarketData,
  ]);
  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
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

  const {
    data: approvedAmount,
    refetch: fetchApprovedAmount,
    isFetching: fetchingApprovedAmount,
    isFetchedAfterMount,
  } = usePoolApprovedAmount(currentMarketData, poolAddress);

  const permitAvailable = tryPermit({
    reserveAddress: poolAddress,
    isWrappedBaseAsset: poolReserve.isWrappedBaseAsset,
  });
  const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  setLoadingTxns(fetchingApprovedAmount);

  const requiresApproval =
    !repayWithATokens &&
    Number(amountToRepay) !== 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount?.amount || '0',
      amount: Number(amountToRepay) === -1 ? maxApproveNeeded : amountToRepay,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });

  if (requiresApproval && approvalTxState?.success) {
    // There was a successful approval tx, but the approval amount is not enough.
    // Clear the state to prompt for another approval.
    setApprovalTxState({});
  }

  const { approval } = useApprovalTx({
    usePermit,
    approvedAmount,
    requiresApproval,
    assetAddress: poolAddress,
    symbol,
    decimals: poolReserve.decimals,
    signatureAmount: amountToRepay,
    onApprovalTxConfirmed: fetchApprovedAmount,
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  useEffect(() => {
    if (!isFetchedAfterMount && !repayWithATokens) {
      fetchApprovedAmount();
    }
  }, [fetchApprovedAmount, isFetchedAfterMount, repayWithATokens]);

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      let response: TransactionResponse;
      let action = ProtocolAction.default;

      if (usePermit && signatureParams) {
        const repayWithPermitParams = {
          amount:
            amountToRepay === '-1'
              ? amountToRepay
              : parseUnits(amountToRepay, poolReserve.decimals).toString(),
          reserve: poolAddress,
          interestRateMode: debtType,
          signature: signatureParams.signature,
          deadline: signatureParams.deadline,
        };

        let encodedParams: [string, string, string] | undefined;
        if (optimizedPath()) {
          encodedParams = await encodeRepayWithPermit(repayWithPermitParams);
        }

        action = ProtocolAction.repayWithPermit;
        let signedRepayWithPermitTxData = repayWithPermit({
          ...repayWithPermitParams,
          encodedTxData: encodedParams ? encodedParams[0] : undefined,
        });

        signedRepayWithPermitTxData = await estimateGasLimit(signedRepayWithPermitTxData);
        response = await sendTx(signedRepayWithPermitTxData);
        await response.wait(1);
      } else {
        const repayParams = {
          amountToRepay:
            amountToRepay === '-1'
              ? amountToRepay
              : parseUnits(amountToRepay, poolReserve.decimals).toString(),
          poolAddress,
          repayWithATokens,
          debtType,
        };

        let encodedParams: string | undefined;
        if (optimizedPath()) {
          encodedParams = await encodeRepayParams(repayParams);
        }

        action = ProtocolAction.repay;
        let repayTxData = repay({
          ...repayParams,
          encodedTxData: encodedParams,
        });
        repayTxData = await estimateGasLimit(repayTxData);
        response = await sendTx(repayTxData);
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

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      queryClient.invalidateQueries({ queryKey: queryKeysFactory.gho });
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
      preparingTransactions={loadingTxns || !approvedAmount}
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
