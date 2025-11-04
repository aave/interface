import { ApproveType, MAX_UINT_AMOUNT, ProtocolAction } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { SignatureLike } from '@ethersproject/bytes';
import { constants, ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { isUSDTOnEthereum, needsUSDTApprovalReset } from 'src/utils/usdtHelpers';
import { useShallow } from 'zustand/shallow';

import { useModalContext } from './useModal';

export interface SignedParams {
  signature: SignatureLike;
  deadline: string;
  amount: string;
}

export const useApprovalTx = ({
  usePermit,
  approvedAmount,
  requiresApproval,
  assetAddress,
  symbol,
  decimals,
  signatureAmount,
  onApprovalTxConfirmed,
  onSignTxCompleted,
  chainId,
  amountToApprove,
  setShowUSDTResetWarning,
}: {
  usePermit: boolean;
  approvedAmount: ApproveType | undefined;
  requiresApproval: boolean;
  assetAddress: string;
  symbol: string;
  decimals: number;
  signatureAmount: string;
  onApprovalTxConfirmed?: () => void;
  onSignTxCompleted?: (signedParams: SignedParams) => void;
  chainId?: number;
  amountToApprove?: string;
  setShowUSDTResetWarning?: (showUSDTResetWarning: boolean) => void;
}) => {
  const [generateApproval, generateSignatureRequest, estimateGasLimit, addTransaction] =
    useRootStore(
      useShallow((store) => [
        store.generateApproval,
        store.generateSignatureRequest,
        store.estimateGasLimit,
        store.addTransaction,
      ])
    );

  const { signTxData, sendTx } = useWeb3Context();

  const { approvalTxState, setApprovalTxState, setTxError } = useModalContext();

  const [requiresApprovalReset, setRequiresApprovalReset] = useState(false);

  // Warning for USDT on Ethereum approval reset
  useEffect(() => {
    if (
      !chainId ||
      !isUSDTOnEthereum(symbol, chainId) ||
      !setShowUSDTResetWarning ||
      !signatureAmount ||
      signatureAmount === '0' ||
      signatureAmount === '-1'
    ) {
      return;
    }

    const amountToApprove = parseUnits(signatureAmount, decimals).toString();
    const currentApproved = approvedAmount?.amount
      ? valueToBigNumber(approvedAmount.amount).toFixed(0)
      : '0';

    if (needsUSDTApprovalReset(symbol, chainId, currentApproved, amountToApprove)) {
      setShowUSDTResetWarning(true);
      setRequiresApprovalReset(true);
    } else {
      setShowUSDTResetWarning(false);
      setRequiresApprovalReset(false);
    }
  }, [symbol, chainId, approvedAmount?.amount, signatureAmount, setShowUSDTResetWarning, decimals]);

  const approval = async () => {
    try {
      if (requiresApproval && approvedAmount) {
        // Handle USDT approval reset first
        if (requiresApprovalReset) {
          const resetData = {
            spender: approvedAmount.spender,
            user: approvedAmount.user,
            token: approvedAmount.token,
            amount: '0',
          };

          try {
            if (usePermit) {
              const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
              const signatureRequest = await generateSignatureRequest(
                {
                  ...resetData,
                  deadline,
                },
                { chainId }
              );
              setApprovalTxState({ ...approvalTxState, loading: true });
              await signTxData(signatureRequest);
              setApprovalTxState({
                loading: false,
                success: false,
              });
            } else {
              // Create direct ERC20 approval transaction for reset to 0
              const abi = new ethers.utils.Interface([
                'function approve(address spender, uint256 amount)',
              ]);
              const encodedData = abi.encodeFunctionData('approve', [approvedAmount.spender, '0']);
              const resetTx = {
                data: encodedData,
                to: approvedAmount.token,
                from: approvedAmount.user,
              };
              const resetTxWithGasEstimation = await estimateGasLimit(resetTx, chainId);
              setApprovalTxState({ ...approvalTxState, loading: true });
              const resetResponse = await sendTx(resetTxWithGasEstimation);
              await resetResponse.wait(1);
              setApprovalTxState({
                loading: false,
                success: false,
              });
            }
          } catch (error) {
            const parsedError = getErrorTextFromError(error, TxAction.APPROVAL, false);
            console.error(parsedError);
            setTxError(parsedError);
            setApprovalTxState({
              txHash: undefined,
              loading: false,
            });
          }
          if (onApprovalTxConfirmed) {
            onApprovalTxConfirmed();
          }

          return;
        }

        // Normal approval logic
        if (usePermit) {
          setApprovalTxState({ ...approvalTxState, loading: true });
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          const signatureRequest = await generateSignatureRequest({
            ...approvedAmount,
            deadline,
            amount:
              signatureAmount === '-1'
                ? constants.MaxUint256.toString()
                : parseUnits(signatureAmount, decimals).toString(),
          });

          const response = await signTxData(signatureRequest);
          if (onSignTxCompleted) {
            onSignTxCompleted({ signature: response, deadline, amount: signatureAmount });
          }
          setTxError(undefined);
          setApprovalTxState({
            txHash: MOCK_SIGNED_HASH,
            loading: false,
            success: true,
          });
        } else {
          let approveTxData = generateApproval(
            approvedAmount,
            amountToApprove ? { amount: amountToApprove } : {}
          );
          setApprovalTxState({ ...approvalTxState, loading: true });
          approveTxData = await estimateGasLimit(approveTxData, chainId);
          const response = await sendTx(approveTxData);
          await response.wait(1);
          setApprovalTxState({
            txHash: response.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
          addTransaction(response.hash, {
            action: ProtocolAction.approval,
            txState: 'success',
            asset: assetAddress,
            amount: MAX_UINT_AMOUNT,
            assetName: symbol,
          });
          if (onApprovalTxConfirmed) {
            onApprovalTxConfirmed();
          }
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

  return {
    approval,
    requiresApprovalReset,
  };
};
