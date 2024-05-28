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
import invariant from 'tiny-invariant';

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
          setApprovalTxState({ ...approvalTxState, loading: true });
          const supplyApprovals = approvals.supplyApprovalTxs;
          const borrowCreditDelegationApprovals = approvals.borrowCreditDelegationApprovalTxs;
          const supplySignatures = await Promise.all(
            supplyApprovals.map(async (supplyApproval) => {
              const supplyAsset = supplyAssets.find(
                (supplyAsset) => supplyAsset.aToken === supplyApproval.to
              );
              invariant(supplyAsset, 'Supply asset not found');
              const signatureRequest = await generateSignatureRequest(
                {
                  token: supplyAsset.aToken,
                  amount: supplyAsset.amount,
                  deadline: supplyAsset.deadline.toString(),
                  spender: fromMarket.addresses.V3_MIGRATOR || '',
                },
                { chainId: fromMarket.chainId }
              );
              return {
                deadline: supplyAsset.deadline,
                aToken: supplyAsset.aToken,
                value: supplyAsset.amount,
                signatureRequest,
              };
            })
          );
          const borrowCreditDelegationSignatures = await Promise.all(
            borrowCreditDelegationApprovals.map(async (borrowCreditDelegationApproval) => {
              const borrowAsset = borrowPermitPayloads.find(
                (borrowAsset) => borrowAsset.underlyingAsset === borrowCreditDelegationApproval.to
              );
              invariant(borrowAsset, 'Borrow asset not found');
              const deadline = Math.floor(Date.now() / 1000 + 3600).toString();
              const signatureRequest = await generateCreditDelegationSignatureRequest(
                {
                  ...borrowAsset,
                  deadline,
                  spender: fromMarket.addresses.V3_MIGRATOR || '',
                },
                { chainId: fromMarket.chainId }
              );
              return {
                deadline,
                debtToken: borrowAsset.underlyingAsset,
                value: borrowAsset.amount,
                signatureRequest,
              };
            })
          );
          const supplySigned: V3MigrationHelperSignedPermit[] = await Promise.all(
            supplySignatures.map(async (signatureRequest) => {
              const signature = await signTxData(signatureRequest.signatureRequest);
              return {
                deadline: signatureRequest.deadline,
                aToken: signatureRequest.aToken,
                value: signatureRequest.value,
                signedPermit: signature,
              };
            })
          );
          const borrowSigned: V3MigrationHelperSignedCreditDelegationPermit[] = await Promise.all(
            borrowCreditDelegationSignatures.map(async (signatureRequest) => {
              const signature = await signTxData(signatureRequest.signatureRequest);
              return {
                deadline: signatureRequest.deadline,
                debtToken: signatureRequest.debtToken,
                value: signatureRequest.value,
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
          const supplyApprovalsResponse = await Promise.all(
            approvals.supplyApprovalTxs.map((supplyApproval) => sendTx(supplyApproval))
          );
          const borrowApprovalsResponse = await Promise.all(
            approvals.borrowCreditDelegationApprovalTxs.map((borrowCreditDelegationApproval) =>
              sendTx(borrowCreditDelegationApproval)
            )
          );
          await Promise.all(supplyApprovalsResponse.map((elem) => elem.wait(1)));
          await Promise.all(borrowApprovalsResponse.map((elem) => elem.wait(1)));
          setApprovalTxState({
            txHash: supplyApprovalsResponse[0]?.hash || borrowApprovalsResponse[0]?.hash,
            loading: false,
            success: true,
          });
          setTxError(undefined);
          queryClient.invalidateQueries(queryKeysFactory.pool);
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
