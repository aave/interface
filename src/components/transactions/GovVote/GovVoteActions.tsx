import { Trans } from '@lingui/macro';
import { EnhancedProposal } from 'src/hooks/governance/useProposal';
import { useModalContext } from 'src/hooks/useModal';

import { TxActionsWrapper } from '../TxActionsWrapper';

export type GovVoteActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  proposal: EnhancedProposal;
  support: boolean;
};

export const GovVoteActions = ({
  isWrongNetwork,
  blocked,
  proposal,
  support,
}: GovVoteActionsProps) => {
  const { mainTxState, loadingTxns } = useModalContext();

  const action = async () => {
    console.log(proposal);
  };

  return (
    <TxActionsWrapper
      requiresApproval={false}
      blocked={blocked}
      mainTxState={mainTxState}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={support ? <Trans>VOTE YAE</Trans> : <Trans>VOTE NAY</Trans>}
      actionInProgressText={support ? <Trans>VOTE YAE</Trans> : <Trans>VOTE NAY</Trans>}
      isWrongNetwork={isWrongNetwork}
    />
  );
};
