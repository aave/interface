import { gasLimitRecommendations, ProtocolAction } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits } from 'ethers/lib/utils';
import { useState } from 'react';
import { useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { APPROVAL_GAS_LIMIT, checkRequiresApproval } from '../utils';

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
  tokenWrapperAddress: string;
  isWrongNetwork: boolean;
}
export const SupplyWrappedTokenActions = ({
  tokenIn,
  amountToSupply,
  decimals,
  symbol,
  tokenWrapperAddress,
  isWrongNetwork,
  sx,
  ...props
}: SupplyWrappedTokenActionProps) => {
  const [user, estimateGasLimit, addTransaction, marketData] = useRootStore((state) => [
    state.account,
    state.estimateGasLimit,
    state.addTransaction,
    state.currentMarketData,
  ]);

  const { tokenWrapperService } = useSharedDependencies();
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

  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();

  const {
    data: approvedAmount,
    isFetching,
    refetch: fetchApprovedAmount,
  } = useApprovedAmount({
    chainId: marketData.chainId,
    token: tokenIn,
    spender: tokenWrapperAddress,
  });

  let requiresApproval = false;
  if (approvedAmount !== undefined) {
    requiresApproval = checkRequiresApproval({
      approvedAmount: approvedAmount.toString(),
      amount: amountToSupply,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });
  }

  // Since the only wrapped token right now is sDAI/DAI, disable permit since it is not supported
  const usePermit = false; // walletApprovalMethodPreference === ApprovalMethod.PERMIT;

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

  if (requiresApproval && approvalTxState?.success) {
    // There was a successful approval tx, but the approval amount is not enough.
    // Clear the state to prompt for another approval.
    setApprovalTxState({});
  }

  const { approval: approvalAction } = useApprovalTx({
    usePermit,
    approvedAmount: {
      amount: approvedAmount?.toString() || '0',
      spender: tokenWrapperAddress,
      token: tokenIn,
      user,
    },
    requiresApproval,
    assetAddress: tokenIn,
    symbol,
    decimals: decimals,
    signatureAmount: amountToSupply,
    onApprovalTxConfirmed: fetchApprovedAmount,
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      let response: TransactionResponse;
      let action = ProtocolAction.default;

      // determine if approval is signature or transaction
      // checking user preference is not sufficient because permit may be available but the user has an existing approval
      if (usePermit && signatureParams) {
        action = ProtocolAction.supplyWithPermit;
        let signedSupplyWithPermitTxData = await tokenWrapperService.supplyWrappedTokenWithPermit(
          parseUnits(amountToSupply, decimals).toString(),
          tokenWrapperAddress,
          user,
          signatureParams.deadline,
          signatureParams.signature
        );

        signedSupplyWithPermitTxData = await estimateGasLimit(signedSupplyWithPermitTxData);
        response = await sendTx(signedSupplyWithPermitTxData);

        await response.wait(1);
      } else {
        action = ProtocolAction.supply;
        let supplyTxData = await tokenWrapperService.supplyWrappedToken(
          parseUnits(amountToSupply, decimals).toString(),
          tokenWrapperAddress,
          user
        );
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

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      queryClient.invalidateQueries({
        queryKey: queryKeysFactory.approvedAmount(
          user,
          tokenIn,
          tokenWrapperAddress,
          marketData.chainId
        ),
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

  return (
    <TxActionsWrapper
      blocked={false}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      requiresAmount
      amount={amountToSupply}
      symbol={symbol}
      preparingTransactions={loadingTxns || isFetching}
      actionText={<Trans>Supply {symbol}</Trans>}
      actionInProgressText={<Trans>Supplying {symbol}</Trans>}
      handleApproval={() => approvalAction()}
      handleAction={action}
      requiresApproval={requiresApproval}
      tryPermit={usePermit}
      sx={sx}
      {...props}
    />
  );
};
