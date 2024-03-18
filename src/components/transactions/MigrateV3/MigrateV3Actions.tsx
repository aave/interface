import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { UserMigrationReserves } from 'src/hooks/migration/useUserMigrationReserves';
import { UserSummaryForMigration } from 'src/hooks/migration/useUserSummaryForMigration';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type MigrateV3ActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  userMigrationReserves: UserMigrationReserves;
  toUserSummaryForMigration: UserSummaryForMigration;
};

export const MigrateV3Actions = ({
  isWrongNetwork,
  blocked,
  userMigrationReserves,
  toUserSummaryForMigration,
}: MigrateV3ActionsProps) => {
  const migrateWithPermits = useRootStore((store) => store.migrateWithPermits);
  const migrateWithoutPermits = useRootStore((store) => store.migrateWithoutPermits);
  const getApprovePermitsForSelectedAssets = useRootStore(
    (store) => store.getApprovePermitsForSelectedAssets
  );
  const { approval, action, loadingTxns, requiresApproval, mainTxState, approvalTxState } =
    useTransactionHandler({
      handleGetTxns: async () =>
        await migrateWithoutPermits(toUserSummaryForMigration, userMigrationReserves),
      handleGetPermitTxns: async (signatures, deadline) =>
        await migrateWithPermits(
          signatures,
          deadline,
          toUserSummaryForMigration,
          userMigrationReserves
        ),
      tryPermit: true,
      permitAction: ProtocolAction.migrateV3,
    });

  const handleApproval = async () => {
    const approvePermitsForSelectedAssets = await getApprovePermitsForSelectedAssets(
      toUserSummaryForMigration,
      userMigrationReserves
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
