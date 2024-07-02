import { gasLimitRecommendations, ProtocolAction, valueToWei } from '@aave/contract-helpers';
import { SignatureLike } from '@ethersproject/bytes';
import { TransactionResponse } from '@ethersproject/providers';
import { Trans } from '@lingui/macro';
import { BoxProps } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { constants } from 'ethers';
import { useEffect, useState } from 'react';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
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

interface WithdrawAndUnwrapActionProps extends BoxProps {
  poolReserve: ComputedReserveData;
  amountToWithdraw: string;
  isWrongNetwork: boolean;
  tokenWrapperAddress: string;
  blocked: boolean;
}

export const WithdrawAndUnwrapAction = ({
  poolReserve,
  amountToWithdraw,
  isWrongNetwork,
  tokenWrapperAddress,
  sx,
  blocked,
}: WithdrawAndUnwrapActionProps) => {
  const [account, estimateGasLimit, walletApprovalMethodPreference, user, marketData] =
    useRootStore((state) => [
      state.account,
      state.estimateGasLimit,
      state.walletApprovalMethodPreference,
      state.account,
      state.currentMarketData,
    ]);

  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();

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

  const { tokenWrapperService } = useSharedDependencies();

  const {
    data: approvedAmount,
    isFetching: fetchingApprovedAmount,
    refetch: fetchApprovedAmount,
  } = useApprovedAmount({
    chainId: marketData.chainId,
    token: poolReserve.aTokenAddress,
    spender: tokenWrapperAddress,
  });

  setLoadingTxns(fetchingApprovedAmount);

  let requiresApproval = false;
  if (approvedAmount !== undefined) {
    requiresApproval = checkRequiresApproval({
      approvedAmount: approvedAmount.toString(),
      amount: amountToWithdraw,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });
  }

  // const permitAvailable = tryPermit(tokenIn);

  const usePermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const { approval: approvalAction } = useApprovalTx({
    usePermit,
    approvedAmount: {
      amount: approvedAmount?.toString() || '0',
      spender: tokenWrapperAddress,
      token: poolReserve.aTokenAddress,
      user,
    },
    requiresApproval,
    assetAddress: poolReserve.aTokenAddress,
    symbol: poolReserve.symbol,
    decimals: poolReserve.decimals,
    signatureAmount: amountToWithdraw,
    onApprovalTxConfirmed: fetchApprovedAmount,
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      let response: TransactionResponse;

      const convertedAmount: string =
        amountToWithdraw === '-1'
          ? constants.MaxUint256.toString()
          : valueToWei(amountToWithdraw, poolReserve.decimals);

      if (usePermit && signatureParams) {
        let signedTxData = await tokenWrapperService.withdrawWrappedTokenWithPermit(
          convertedAmount,
          tokenWrapperAddress,
          user,
          signatureParams.deadline,
          signatureParams.signature
        );
        signedTxData = await estimateGasLimit(signedTxData);
        response = await sendTx(signedTxData);
        await response.wait(1);
      } else {
        let txData = await tokenWrapperService.withdrawWrappedToken(
          convertedAmount,
          tokenWrapperAddress,
          account
        );
        txData = await estimateGasLimit(txData);
        response = await sendTx(txData);
        await response.wait(1);
      }
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool });
      queryClient.invalidateQueries({
        queryKey: queryKeysFactory.approvedAmount(
          user,
          poolReserve.aTokenAddress,
          tokenWrapperAddress,
          marketData.chainId
        ),
      });
    } catch (error) {
      const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setApprovalTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  useEffect(() => {
    let gasLimit = 0;
    gasLimit = Number(gasLimitRecommendations[ProtocolAction.withdraw].recommended);
    if (requiresApproval && !approvalTxState.success) {
      gasLimit += Number(APPROVAL_GAS_LIMIT);
    }

    setGasLimit(gasLimit.toString());
  }, [requiresApproval, approvalTxState, usePermit, setGasLimit]);

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns}
      approvalTxState={approvalTxState}
      mainTxState={mainTxState}
      amount={amountToWithdraw}
      isWrongNetwork={isWrongNetwork}
      requiresAmount
      actionInProgressText={<Trans>Withdrawing</Trans>}
      actionText={<Trans>Withdraw</Trans>}
      handleAction={action}
      requiresApproval={requiresApproval}
      handleApproval={approvalAction}
      sx={sx}
      tryPermit
    />
  );
};
