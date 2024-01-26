import { AaveSafetyModule } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { useState } from 'react';
import { SignedParams, useApprovalTx } from 'src/hooks/useApprovalTx';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { ApprovalMethod } from 'src/store/walletSlice';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { checkRequiresApproval } from '../utils';

export const StakingMigrateActions = ({ amountToMigrate }: { amountToMigrate: string }) => {
  const { stkAbptMigrationService, approvedAmountService } = useSharedDependencies();
  const [walletApprovalMethodPreference, currentMarketData, user] = useRootStore((store) => [
    store.walletApprovalMethodPreference,
    store.currentMarketData,
    store.account,
  ]);
  const { sendTx } = useWeb3Context();
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

  const usePermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const {
    data: approvedAmount,
    refetch: fetchApprovedAmount,
    isFetching: fetchingApprovedAmount,
    isFetchedAfterMount,
  } = useApprovedAmount({
    marketData: currentMarketData,
    token: AaveSafetyModule.STK_ABPT,
    spender: AaveSafetyModule.STK_ABPT_STK_AAVE_WSTETH_BPTV2_MIGRATOR,
  });

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

  const { approval } = useApprovalTx({
    usePermit: false,
    approvedAmount: {
      user,
      token: AaveSafetyModule.STK_ABPT,
      amount: approvedAmount?.toString() || '0',
      spender: AaveSafetyModule.STK_ABPT_STK_AAVE_WSTETH_BPTV2_MIGRATOR,
    },
    requiresApproval,
    assetAddress: AaveSafetyModule.STK_ABPT,
    symbol: 'STK_ABPT',
    decimals: 18,
    signatureAmount: amountToMigrate,
    onApprovalTxConfirmed: fetchApprovedAmount,
    onSignTxCompleted: (signedParams) => setSignatureParams(signedParams),
  });

  console.log(requiresApproval);
  const action = async () => {
    console.log('todo');
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
    />
  );
};
