import { PoolInterface } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { TxActionsWrapper } from '../TxActionsWrapper';

export type EmodeActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  selectedEmode: number;
};

export const EmodeActions = ({ isWrongNetwork, blocked, selectedEmode }: EmodeActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentAccount } = useWeb3Context();

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      const newPool: PoolInterface = lendingPool as PoolInterface;
      return newPool.setUserEMode({
        user: currentAccount,
        categoryId: selectedEmode,
      });
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
        selectedEmode !== 0 ? <Trans>Enable E-Mode</Trans> : <Trans>Disable E-Mode</Trans>
      }
      actionInProgressText={
        selectedEmode !== 0 ? <Trans>Enabling E-Mode</Trans> : <Trans>Disabling E-Mode</Trans>
      }
      isWrongNetwork={isWrongNetwork}
    />
  );
};
