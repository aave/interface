import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { TxActionsWrapper } from '../TxActionsWrapper';

export type GovVoteActionsProps = {
  isWrongNetwork: boolean;
  blocked: boolean;
  proposalId: number;
  support: boolean;
};

export const GovVoteActions = ({
  isWrongNetwork,
  blocked,
  proposalId,
  support,
}: GovVoteActionsProps) => {
  const { governanceService } = useGovernanceDataProvider();
  const { currentAccount } = useWeb3Context();

  const { action, loadingTxns, mainTxState, requiresApproval } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return governanceService.submitVote({
        proposalId: Number(proposalId),
        user: currentAccount,
        support: support || false,
      });
    },
    skip: blocked,
    deps: [],
  });

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
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
