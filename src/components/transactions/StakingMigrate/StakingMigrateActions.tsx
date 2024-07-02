import {
  ChainId,
  gasLimitRecommendations,
  ProtocolAction,
  valueToWei,
} from '@aave/contract-helpers';
import { AaveSafetyModule } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { PopulatedTransaction } from 'ethers';
import { useEffect, useState } from 'react';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
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

export const StakingMigrateActions = ({
  amountToMigrate,
  minOutWithSlippage,
}: {
  amountToMigrate: string;
  minOutWithSlippage: string;
}) => {
  const { stkAbptMigrationService } = useSharedDependencies();
  const [
    walletApprovalMethodPreference,
    currentMarketData,
    user,
    estimateGasLimit,
    addTransaction,
  ] = useRootStore((store) => [
    store.walletApprovalMethodPreference,
    store.currentMarketData,
    store.account,
    store.estimateGasLimit,
    store.addTransaction,
  ]);
  const { sendTx } = useWeb3Context();
  const queryClient = useQueryClient();
  const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setApprovalTxState,
    setMainTxState,
    setLoadingTxns,
    setTxError,
    setGasLimit,
  } = useModalContext();
  const usePermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const {
    data: approvedAmount,
    refetch: fetchApprovedAmount,
    isFetching: fetchingApprovedAmount,
    isFetchedAfterMount,
  } = useApprovedAmount({
    chainId: currentMarketData.chainId,
    token: AaveSafetyModule.STK_ABPT,
    spender: AaveSafetyModule.STK_ABPT_STK_AAVE_WSTETH_BPTV2_MIGRATOR,
  });

  setLoadingTxns(fetchingApprovedAmount);

  const requiresApproval =
    Number(amountToMigrate) !== 0 &&
    checkRequiresApproval({
      approvedAmount: approvedAmount ? approvedAmount.toString() : '0',
      amount: amountToMigrate,
      signedAmount: signatureParams ? signatureParams.amount : '0',
    });

  if (requiresApproval && approvalTxState?.success) {
    // There was a successful approval tx, but the approval amount is not enough.
    // Clear the state to prompt for another approval.
    setApprovalTxState({});
  }

  useEffect(() => {
    if (!isFetchedAfterMount) {
      fetchApprovedAmount();
    }
  }, [fetchApprovedAmount, isFetchedAfterMount]);

  useEffect(() => {
    let migrateGasLimit = 0;
    migrateGasLimit = Number(gasLimitRecommendations[ProtocolAction.migrateABPT].recommended);
    if (requiresApproval && !approvalTxState.success) {
      migrateGasLimit += Number(APPROVAL_GAS_LIMIT);
    }
    setGasLimit(migrateGasLimit.toString());
  }, [requiresApproval, approvalTxState, setGasLimit]);

  const { approval } = useApprovalTx({
    usePermit,
    approvedAmount: {
      user,
      token: AaveSafetyModule.STK_ABPT,
      amount: approvedAmount?.toString() || '0',
      spender: AaveSafetyModule.STK_ABPT_STK_AAVE_WSTETH_BPTV2_MIGRATOR,
    },
    requiresApproval,
    assetAddress: AaveSafetyModule.STK_ABPT,
    symbol: 'stkABPT',
    decimals: 18,
    signatureAmount: amountToMigrate,
    onApprovalTxConfirmed: fetchApprovedAmount,
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      const amount = valueToWei(amountToMigrate, 18);
      let txData: PopulatedTransaction;

      if (usePermit && signatureParams) {
        txData = await stkAbptMigrationService.migrateWithPermit(
          user,
          amount,
          minOutWithSlippage,
          signatureParams.signature,
          signatureParams.deadline
        );
      } else {
        txData = await stkAbptMigrationService.migrate(user, amount, minOutWithSlippage);
      }

      txData = await estimateGasLimit(txData, ChainId.mainnet);
      const response = await sendTx(txData);
      await response.wait(1);

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.staking });

      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
      });
      addTransaction(response.hash, {
        action: 'todo',
        txState: 'success',
        asset: AaveSafetyModule.STK_ABPT,
        amount: amountToMigrate,
        assetName: 'stkABPT',
      });
    } catch (e) {
      const parsedError = getErrorTextFromError(e, TxAction.GAS_ESTIMATION, false);
      setTxError(parsedError);
      setMainTxState({
        txHash: undefined,
        loading: false,
      });
    }
  };

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={false}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<Trans>Migrate</Trans>}
      actionInProgressText={<Trans>Migrating</Trans>}
      mainTxState={mainTxState}
      isWrongNetwork={false}
      amount={amountToMigrate}
      requiresAmount
      handleApproval={approval}
      approvalTxState={approvalTxState}
      tryPermit
    />
  );
};
