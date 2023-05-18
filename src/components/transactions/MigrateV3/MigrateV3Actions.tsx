import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useMigrationData } from 'src/hooks/migration/useMigrationData';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type MigrateV3ActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
};

export const MigrateV3Actions = ({ isWrongNetwork, blocked }: MigrateV3ActionsProps) => {
  const migrateWithPermits = useRootStore((store) => store.migrateWithPermits);
  const migrateWithoutPermits = useRootStore((store) => store.migrateWithoutPermits);
  const getApprovePermitsForSelectedAssets = useRootStore(
    (store) => store.getApprovePermitsForSelectedAssets
  );
  const { borrowPermitPayloads, supplyPermitPayloads, supplyAssetsNoPermit, repayAssets } =
    useMigrationData();

  const { approval, action, loadingTxns, requiresApproval, mainTxState, approvalTxState } =
    useTransactionHandler({
      handleGetTxns: async () =>
        await migrateWithoutPermits(borrowPermitPayloads, supplyAssetsNoPermit, repayAssets),
      handleGetPermitTxns: async (signatures, deadline) =>
        await migrateWithPermits(
          signatures,
          deadline,
          supplyAssetsNoPermit,
          repayAssets,
          borrowPermitPayloads
        ),
      tryPermit: true,
      permitAction: ProtocolAction.migrateV3,
    });

  const handleApproval = async () => {
    const approvePermitsForSelectedAssets = await getApprovePermitsForSelectedAssets(
      borrowPermitPayloads,
      supplyPermitPayloads
    );
    approval(approvePermitsForSelectedAssets);
  };

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      handleAction={action}
      handleApproval={handleApproval}
      blocked={blocked}
      actionText={<Trans>Migrate</Trans>}
      actionInProgressText={<Trans>Migrating</Trans>}
      tryPermit
    />
  );
};
