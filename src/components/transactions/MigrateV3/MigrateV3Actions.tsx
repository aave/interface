import {
  MigrationDelegationApproval,
  V3MigrationHelperSignedCreditDelegationPermit,
  V3MigrationHelperSignedPermit,
} from '@aave/contract-helpers/dist/esm/v3-migration-contract/v3MigrationTypes';
import { Trans } from '@lingui/macro';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
import { useMigrationApprovalTxs } from 'src/hooks/migration/useMigrationApprovalTxs';
import { UserMigrationReserves } from 'src/hooks/migration/useUserMigrationReserves';
import { UserSummaryForMigration } from 'src/hooks/migration/useUserSummaryForMigration';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import {
  selectMigrationBorrowPermitPayloads,
  selectMigrationRepayAssets,
  selectUserSupplyAssetsForMigrationNoPermit,
} from 'src/store/v3MigrationSelectors';
import { ApprovalMethod } from 'src/store/walletSlice';
import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { useSharedDependencies } from 'src/ui-config/SharedDependenciesProvider';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type MigrateV3ActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  userMigrationReserves: UserMigrationReserves;
  toUserSummaryForMigration: UserSummaryForMigration;
  fromMarket: MarketDataType;
  toMarket: MarketDataType;
};

export const MigrateV3Actions = ({
  isWrongNetwork,
  blocked,
  userMigrationReserves,
  toUserSummaryForMigration,
  fromMarket,
  toMarket,
}: MigrateV3ActionsProps) => {
  const [signatures, setSignatures] = useState<{
    supply: V3MigrationHelperSignedPermit[];
    borrow: V3MigrationHelperSignedCreditDelegationPermit[];
  }>({
    supply: [],
    borrow: [],
  });
  const { signTxData, sendTx } = useWeb3Context();
  const [
    user,
    walletApprovalMethodPreference,
    selectedMigrationSupplyAssets,
    selectedMigrationBorrowAssets,
    generateCreditDelegationSignatureRequest,
    generateSignatureRequest,
    estimateGasLimit,
  ] = useRootStore((store) => [
    store.account,
    store.walletApprovalMethodPreference,
    store.selectedMigrationSupplyAssets,
    store.selectedMigrationBorrowAssets,
    store.generateCreditDelegationSignatureRequest,
    store.generateSignatureRequest,
    store.estimateGasLimit,
  ]);
  const { approvalTxState, mainTxState, setApprovalTxState, setTxError, setMainTxState } =
    useModalContext();
  const queryClient = useQueryClient();

  const { migrationService } = useSharedDependencies();

  const usePermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  const supplyAssets = selectUserSupplyAssetsForMigrationNoPermit(
    selectedMigrationSupplyAssets,
    userMigrationReserves.supplyReserves,
    userMigrationReserves.isolatedReserveV3
  );

  const repayAssets = selectMigrationRepayAssets(
    selectedMigrationBorrowAssets,
    userMigrationReserves.borrowReserves
  );

  const borrowPermitPayloads = selectMigrationBorrowPermitPayloads(
    selectedMigrationBorrowAssets,
    toUserSummaryForMigration,
    userMigrationReserves.borrowReserves,
    true
  );

  const creditDelegationApprovals: MigrationDelegationApproval[] = borrowPermitPayloads.map(
    ({ underlyingAsset, amount }) => ({ debtTokenAddress: underlyingAsset, amount })
  );

  const { data: approvals, isLoading: approvalsLoading } = useMigrationApprovalTxs(
    fromMarket,
    toMarket,
    supplyAssets,
    creditDelegationApprovals
  );

  const requiresApproval = approvals
    ? approvals.supplyApprovalTxs.length > 0 ||
      approvals.borrowCreditDelegationApprovalTxs.length > 0
    : false;

  const approval = async () => {
    if (requiresApproval && approvals) {
      try {
        if (usePermit) {
          const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
          setApprovalTxState({ ...approvalTxState, loading: true });
          const supplyApprovals = approvals.supplyApprovalTxs;
          const borrowCreditDelegationApprovals = approvals.borrowCreditDelegationApprovalTxs;
          const supplySigned = await Promise.all(
            supplyApprovals.map(async (supplyApproval) => {
              const signatureRequest = await generateSignatureRequest(
                {
                  token: supplyApproval.token,
                  amount: supplyApproval.amount,
                  deadline: deadline.toString(),
                  spender: supplyApproval.spender,
                },
                { chainId: fromMarket.chainId }
              );
              const signature = await signTxData(signatureRequest);
              return {
                deadline: deadline.toString(),
                aToken: supplyApproval.token,
                value: supplyApproval.amount,
                signedPermit: signature,
              };
            })
          );
          const borrowSigned = await Promise.all(
            borrowCreditDelegationApprovals.map(async (borrowCreditDelegationApproval) => {
              const signatureRequest = await generateCreditDelegationSignatureRequest(
                {
                  amount: borrowCreditDelegationApproval.amount,
                  underlyingAsset: borrowCreditDelegationApproval.debtTokenAddress,
                  deadline,
                  spender: borrowCreditDelegationApproval.delegatee,
                },
                { chainId: fromMarket.chainId }
              );
              const signature = await signTxData(signatureRequest);
              return {
                deadline,
                debtToken: borrowCreditDelegationApproval.debtTokenAddress,
                value: borrowCreditDelegationApproval.amount,
                signedPermit: signature,
              };
            })
          );
          setSignatures({
            supply: supplySigned,
            borrow: borrowSigned,
          });
          setTxError(undefined);
          setApprovalTxState({
            txHash: MOCK_SIGNED_HASH,
            loading: false,
            success: true,
          });
        } else {
          setApprovalTxState({ ...approvalTxState, loading: true });
          const allTxs = [
            ...approvals.supplyApprovalTxs,
            ...approvals.borrowCreditDelegationApprovalTxs,
          ];
          const txsApprovalResponse = await Promise.all(
            allTxs.map((approval) => sendTx(approval.tx))
          );
          await Promise.all(txsApprovalResponse.map((elem) => elem.wait(1)));
          setApprovalTxState({
            txHash: txsApprovalResponse[0]?.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
        }
      } catch (error) {
        const parsedError = getErrorTextFromError(error, TxAction.GAS_ESTIMATION, false);
        setTxError(parsedError);
        setApprovalTxState({
          txHash: undefined,
          loading: false,
        });
      }
    }
  };

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true });
      let tx = migrationService.getMigrationTx(
        fromMarket,
        toMarket,
        user,
        supplyAssets,
        repayAssets,
        signatures.supply,
        signatures.borrow
      );
      tx = await estimateGasLimit(tx, fromMarket.chainId);
      const response = await sendTx(tx);
      await response.wait(1);
      queryClient.invalidateQueries(queryKeysFactory.pool);
      setMainTxState({
        txHash: response.hash,
        loading: false,
        success: true,
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
      requiresApproval={requiresApproval}
      preparingTransactions={approvalsLoading}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      handleAction={action}
      handleApproval={approval}
      blocked={blocked}
      actionText={<Trans>Migrate</Trans>}
      actionInProgressText={<Trans>Migrating</Trans>}
      tryPermit
    />
  );
};
