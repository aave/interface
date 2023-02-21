import { Trans } from '@lingui/macro';
import { DelegationType } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useRootStore } from 'src/store/root';

import { TxActionsWrapper } from '../TxActionsWrapper';
import { DelegationToken } from './DelegationTokenSelector';

export type GovDelegationActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  delegationType: DelegationType;
  delegationToken?: DelegationToken;
  delegate: string;
};

export const GovDelegationActions = ({
  isWrongNetwork,
  blocked,
  delegationType,
  delegationToken,
  delegate,
}: GovDelegationActionsProps) => {
  const delegateByType = useRootStore((state) => state.delegateByType);
  const delegateFunc = useRootStore((state) => state.delegate);

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      if (delegationType === DelegationType.BOTH) {
        return delegateFunc({
          delegatee: delegate,
          governanceToken: (delegationToken as DelegationToken).address,
        });
      }
      return delegateByType({
        delegatee: delegate,
        delegationType,
        governanceToken: (delegationToken as DelegationToken).address,
      });
    },
    skip: blocked || !delegationToken?.address,
    deps: [delegate, delegationType, delegationToken?.address],
  });

  // TODO: hash link not working
  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      handleAction={action}
      actionText={<Trans>Delegate</Trans>}
      actionInProgressText={<Trans>Delegating</Trans>}
    />
  );
};
