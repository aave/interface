import { ProtocolAction } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { EmodeCategory } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { getEmodeMessage } from './EmodeNaming';

export type EmodeActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedEmode: number;
  activeEmode: number;
  eModes: Record<number, EmodeCategory>;
};

export const EmodeActions = ({
  isWrongNetwork,
  blocked,
  selectedEmode,
  activeEmode,
  eModes,
}: EmodeActionsProps) => {
  const setUserEMode = useRootStore((state) => state.setUserEMode);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return setUserEMode(selectedEmode);
    },
    skip: blocked,
    deps: [selectedEmode],
    protocolAction: ProtocolAction.setEModeUsage,
    eventTxInfo: {
      previousState: getEmodeMessage(eModes[activeEmode].label),
      newState: getEmodeMessage(eModes[selectedEmode].label),
    },
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
