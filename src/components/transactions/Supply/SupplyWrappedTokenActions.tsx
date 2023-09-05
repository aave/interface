import { gasLimitRecommendations, MAX_UINT_AMOUNT, ProtocolAction } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import { useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';
import { useApprovedAmount } from './useApprovedAmount';

interface SignedParams {
  signature: SignatureLike;
  deadline: string;
  amount: string;
}

interface SupplyWrappedTokenActionProps extends BoxProps {
  tokenIn: string;
  amountToSupply: string;
  decimals: number;
  symbol: string;
}
export const SupplyWrappedTokenActions = ({
  tokenIn,
  amountToSupply,
  decimals,
  symbol,
  sx,
  ...props
}: SupplyWrappedTokenActionProps) => {
  const [
    currentMarketData,
    tryPermit,
    walletApprovalMethodPreference,
    generateSignatureRequest,
    generateApproval,
    estimateGasLimit,
    addTransaction,
    supplyDaiAsSavingsDaiWithPermit,
    supplyDaiAsSavingsDai,
  ] = useRootStore((state) => [
    state.currentMarketData,
    state.tryPermit,
    state.walletApprovalMethodPreference,
    state.generateSignatureRequest,
    state.generateApproval,
    state.estimateGasLimit,
    state.addTransaction,
    state.supplyDaiAsSavingsDaiWithPermit,
    state.supplyDaiAsSavingsDai,
  ]);

  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setApprovalTxState,
    setMainTxState,
    setTxError,
    setGasLimit,
  } = useModalContext();

  const { signTxData, sendTx } = useWeb3Context();

  const { loading: loadingApprovedAmount, approval } = useApprovedAmount({
    spender: currentMarketData.addresses.SDAI_TOKEN_WRAPPER || '',
    tokenAddress: tokenIn,
  });

  let requiresApproval = false;
  if (approval) {
    requiresApproval = checkRequiresApproval({
      approvedAmount: approval.amount,
      amount: amountToSupply,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });
  }

  const permitAvailable = tryPermit(tokenIn);

  const usePermit = permitAvailable && walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  // Update gas estimation
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

  console.log('loading approved amount', loadingApprovedAmount);
  console.log('approval', approval);

  const approvalAction = async () => {
    try {
      if (requiresApproval && approval) {
        if (usePermit) {
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const signatureRequest = await generateSignatureRequest({
            ...approval,
            deadline,
            amount: parseUnits(amountToSupply, decimals).toString(),
          });

          const response = await signTxData(signatureRequest);
          setSignatureParams({ signature: response, deadline, amount: amountToSupply });
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
      setMainTxState({ ...mainTxState, loading: true });

      let response: TransactionResponse;
      let action = ProtocolAction.default;

      // determine if approval is signature or transaction
      // checking user preference is not sufficient because permit may be available but the user has an existing approval
      if (usePermit && signatureParams) {
        action = ProtocolAction.supplyWithPermit;
        let signedSupplyWithPermitTxData = supplyDaiAsSavingsDaiWithPermit(
          parseUnits(amountToSupply, decimals).toString(),
          signatureParams.deadline,
          signatureParams.signature
        );

        signedSupplyWithPermitTxData = await estimateGasLimit(signedSupplyWithPermitTxData);
        response = await sendTx(signedSupplyWithPermitTxData);

        await response.wait(1);
      } else {
        action = ProtocolAction.supply;
        let supplyTxData = supplyDaiAsSavingsDai(parseUnits(amountToSupply, decimals).toString());
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
        asset: tokenIn,
        amount: amountToSupply,
        assetName: symbol,
      });

      // queryClient.invalidateQueries({ queryKey: [QueryKeys.POOL_TOKENS] });
      // refetchPoolData && refetchPoolData();
      // refetchIncentiveData && refetchIncentiveData();
      // refetchGhoData && refetchGhoData();
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  return (
    <TxActionsWrapper
      blocked={false} // TODO
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={false} // TODO
      requiresAmount
      amount={amountToSupply}
      symbol={symbol}
      preparingTransactions={loadingTxns}
      actionText={<Trans>Supply {symbol}</Trans>}
      actionInProgressText={<Trans>Supplying {symbol}</Trans>}
      handleApproval={() => approvalAction()}
      handleAction={action}
      requiresApproval={requiresApproval}
      tryPermit={permitAvailable}
      sx={sx}
      {...props}
    />
  );
};
