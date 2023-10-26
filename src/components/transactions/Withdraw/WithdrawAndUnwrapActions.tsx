import { MAX_UINT_AMOUNT, ProtocolAction, TokenWrapperService } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { Trans } from '@lingui/macro';
import { parseUnits } from 'ethers/lib/utils';
import { useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

import { useApprovedAmount } from '../Supply/useApprovedAmount';
import { TxActionsWrapper } from '../TxActionsWrapper';
import { checkRequiresApproval } from '../utils';

interface SignedParams {
  signature: SignatureLike;
  deadline: string;
  amount: string;
}

interface WithdrawAndUnwrapActionProps {
  reserve: string;
  amountToWithdraw: string;
  isWrongNetwork: boolean;
  tokenIn: string;
  tokenOut: string;
  tokenWrapperAddress: string;
  decimals: number;
  symbol: string;
}

export const WithdrawAndUnwrapAction = ({
  reserve,
  amountToWithdraw,
  isWrongNetwork,
  tokenIn,
  tokenOut,
  tokenWrapperAddress,
  decimals,
  symbol,
}: WithdrawAndUnwrapActionProps) => {
  const [
    provider,
    wrapperAddress,
    account,
    estimateGasLimit,
    walletApprovalMethodPreference,
    tryPermit,
    generateSignatureRequest,
    generateApproval,
    addTransaction,
  ] = useRootStore((state) => [
    state.jsonRpcProvider,
    state.currentMarketData.addresses.SDAI_TOKEN_WRAPPER,
    state.account,
    state.estimateGasLimit,
    state.walletApprovalMethodPreference,
    state.tryPermit,
    state.generateSignatureRequest,
    state.generateApproval,
    state.addTransaction,
  ]);

  const { signTxData, sendTx } = useWeb3Context();

  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setLoadingTxns,
    setApprovalTxState,
    setMainTxState,
    setGasLimit,
    setTxError,
  } = useModalContext();

  const { loading: loadingApprovedAmount, approval } = useApprovedAmount({
    spender: tokenWrapperAddress,
    tokenAddress: tokenIn,
  });

  let requiresApproval = false;
  if (approval) {
    requiresApproval = checkRequiresApproval({
      approvedAmount: approval.amount,
      amount: amountToWithdraw,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });
  }

  const permitAvailable = tryPermit(tokenIn);

  const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const approvalAction = async () => {
    try {
      if (requiresApproval && approval) {
        if (usePermit) {
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const signatureRequest = await generateSignatureRequest({
            ...approval,
            deadline,
            amount: parseUnits(amountToWithdraw, decimals).toString(),
          });

          const response = await signTxData(signatureRequest);
          setSignatureParams({ signature: response, deadline, amount: amountToWithdraw });
          setApprovalTxState({
            txHash: MOCK_SIGNED_HASH,
            loading: false,
            success: true,
          });
        } else {
          let approveTxData = generateApproval(approval);
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
            asset: tokenIn,
            amount: MAX_UINT_AMOUNT,
            assetName: symbol,
          });
          // fetchApprovedAmount(true);
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
      const service = new TokenWrapperService(provider(), wrapperAddress || '');
      let txData = service.withdrawToken(amountToWithdraw, account);
      txData = await estimateGasLimit(txData);
      const response = await sendTx(txData);

      await response.wait(1);
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  return (
    <TxActionsWrapper
      blocked={false}
      preparingTransactions={loadingTxns}
      approvalTxState={approvalTxState}
      mainTxState={mainTxState}
      amount={amountToWithdraw}
      isWrongNetwork={isWrongNetwork}
      requiresAmount
      actionInProgressText={<Trans>Withdrawing</Trans>}
      actionText={<Trans>Withdraw</Trans>}
      handleAction={action}
      requiresApproval={false}
    />
  );
};
