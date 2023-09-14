import { ProtocolAction } from '@aave/contract-helpers';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { parseUnits } from '@ethersproject/units';
import { Trans } from '@lingui/macro';
import { queryClient } from 'pages/_app.page';
import { useEffect, useState } from 'react';
import { useBackgroundDataProvider } from 'src/hooks/app-data-provider/BackgroundDataProvider';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { QueryKeys } from 'src/ui-config/queries';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { checkRequiresApproval } from '../utils';

export const WithdrawAndUnwrapActions = ({
  poolReserve,
  amountToWithdraw,
  symbol,
}: {
  poolReserve: ComputedReserveData;
  amountToWithdraw: string;
  symbol: string;
}) => {
  const [
    currentMarketData,
    walletApprovalMethodPreference,
    estimateGasLimit,
    addTransaction,
    withdrawDaiFromSavingsDaiWithPermit,
    withdrawDaiFromSavingsDai,
  ] = useRootStore((state) => [
    state.currentMarketData,
    state.walletApprovalMethodPreference,
    state.estimateGasLimit,
    state.addTransaction,
    state.withdrawDaiFromSavingsDaiWithPermit,
    state.withdrawDaiFromSavingsDai,
  ]);

  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setApprovalTxState,
    setLoadingTxns,
    setMainTxState,
    setTxError,
  } = useModalContext();

  const { sendTx } = useWeb3Context();

  const { refetchPoolData } = useBackgroundDataProvider();

  const { aTokenAddress, decimals } = poolReserve;

  const {
    data: approvedAmount,
    refetch: fetchApprovedAmount,
    isRefetching: fetchingApprovedAmount,
    isFetchedAfterMount,
  } = useApprovedAmount({
    token: aTokenAddress,
    spender: currentMarketData.addresses.SDAI_TOKEN_WRAPPER || '',
  });

  const requiresApproval =
    Number(amountToWithdraw) !== 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount?.amount || '0',
      amount: amountToWithdraw,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });

  if (requiresApproval && approvalTxState?.success) {
    // There was a successful approval tx, but the approval amount is not enough.
    // Clear the state to prompt for another approval.
    setApprovalTxState({});
  }

  const usePermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const { approval } = useApprovalTx({
    usePermit,
    approvedAmount,
    requiresApproval,
    assetAddress: aTokenAddress,
    symbol,
    decimals,
    signatureAmount: amountToWithdraw,
    onApprovalTxConfirmed: fetchApprovedAmount,
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  setLoadingTxns(fetchingApprovedAmount);

  useEffect(() => {
    if (!isFetchedAfterMount) {
      fetchApprovedAmount();
    }
  }, [fetchApprovedAmount, isFetchedAfterMount]);

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });

      let response: TransactionResponse;
      const action = ProtocolAction.default; // TODO

      if (usePermit && signatureParams) {
        let signedTxData = withdrawDaiFromSavingsDaiWithPermit(
          parseUnits(amountToWithdraw, decimals).toString(),
          signatureParams.deadline,
          signatureParams.signature
        );

        signedTxData = await estimateGasLimit(signedTxData);
        response = await sendTx(signedTxData);

        await response.wait(1);
      } else {
        let txData = withdrawDaiFromSavingsDai(parseUnits(amountToWithdraw, decimals).toString());

        txData = await estimateGasLimit(txData);
        response = await sendTx(txData);

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
        asset: aTokenAddress,
        amount: amountToWithdraw,
        assetName: symbol,
      });

      queryClient.invalidateQueries({ queryKey: [QueryKeys.POOL_TOKENS] });
      refetchPoolData && refetchPoolData();
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
      preparingTransactions={loadingTxns}
      approvalTxState={approvalTxState}
      mainTxState={mainTxState}
      amount={amountToWithdraw}
      isWrongNetwork={false} // TODO
      requiresAmount
      actionInProgressText={<Trans>Withdrawing {symbol}</Trans>}
      actionText={<Trans>Withdraw {symbol}</Trans>}
      handleAction={action}
      handleApproval={approval}
      requiresApproval={requiresApproval}
    />
  );
};
