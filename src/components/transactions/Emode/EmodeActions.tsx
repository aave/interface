import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type EmodeActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedEmode: number;
  activeEmode: number;
};

export const EmodeActions = ({
  isWrongNetwork,
  blocked,
  selectedEmode,
  activeEmode,
}: EmodeActionsProps) => {
  const setUserEMode = useRootStore((state) => state.setUserEMode);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return setUserEMode(selectedEmode);
    },
    skip: blocked,
    deps: [selectedEmode],
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      mainTxState={mainTxState}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={
        activeEmode === 0 ? (
          <Trans>Enable E-Mode</Trans>
        ) : selectedEmode !== 0 ? (
          <Trans>Switch E-Mode</Trans>
        ) : (
          <Trans>Disable E-Mode</Trans>
        )
      }
      actionInProgressText={
        activeEmode === 0 ? (
          <Trans>Enabling E-Mode</Trans>
        ) : selectedEmode !== 0 ? (
          <Trans>Switching E-Mode</Trans>
        ) : (
          <Trans>Disabling E-Mode</Trans>
        )
      }
      isWrongNetwork={isWrongNetwork}
    />
  );
};
