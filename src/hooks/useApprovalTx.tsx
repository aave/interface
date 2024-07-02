import { ApproveType, MAX_UINT_AMOUNT, ProtocolAction } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { constants } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';

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
}) => {
  const [generateApproval, generateSignatureRequest, estimateGasLimit, addTransaction] =
    useRootStore((store) => [
      store.generateApproval,
      store.generateSignatureRequest,
      store.estimateGasLimit,
      store.addTransaction,
    ]);

  const { signTxData, sendTx } = useWeb3Context();

  const { approvalTxState, setApprovalTxState, setTxError } = useModalContext();

  const approval = async () => {
    try {
      if (requiresApproval && approvedAmount) {
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
  };
};
