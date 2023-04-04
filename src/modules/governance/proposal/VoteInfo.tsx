import { ProposalState } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useVoteOnProposal } from 'src/hooks/governance/useVoteOnProposal';
import { useVotingPowerAt } from 'src/hooks/governance/useVotingPowerAt';
import { useModalContext } from 'src/hooks/useModal';
import { CustomProposalType } from 'src/static-build/proposal';
import { useRootStore } from 'src/store/root';

export function VoteInfo({ id, state, strategy, startBlock }: CustomProposalType) {
  const { openGovVote } = useModalContext();
  const user = useRootStore((state) => state.account);

  const { data: voteOnProposal } = useVoteOnProposal({ proposalId: id });
  const { data: powerAtProposalStart } = useVotingPowerAt({ block: startBlock, strategy });

  const voteOngoing = state === ProposalState.Active;

  // Messages
  const alreadyVoted = voteOnProposal && voteOnProposal.votingPower !== '0';
  const cannotVote = voteOngoing && powerAtProposalStart === '0';
  const canVote =
    powerAtProposalStart && voteOngoing && !alreadyVoted && powerAtProposalStart !== '0';

  return (
    <>
      <Typography variant="h3" sx={{ mb: 8 }}>
        <Trans>Your voting info</Trans>
      </Typography>
      {user ? (
        <>
          {!alreadyVoted && !voteOngoing && (
            <Typography sx={{ textAlign: 'center' }} color="text.muted">
              <Trans>You did not participate in this proposal</Trans>
            </Typography>
          )}
          {voteOngoing && (
            <Row
              caption={
                <>
                  <Typography variant="description">
                    <Trans>Voting power</Trans>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (AAVE + stkAAVE)
                  </Typography>
                </>
              }
            >
              <FormattedNumber
                value={powerAtProposalStart || 0}
                variant="main16"
                visibleDecimals={2}
              />
            </Row>
          )}
          {alreadyVoted && (
            <Warning severity={voteOnProposal.support ? 'success' : 'error'} sx={{ my: 2 }}>
              <Typography variant="subheader1">
                <Trans>You voted {voteOnProposal.support ? 'YAE' : 'NAY'}</Trans>
              </Typography>
              <Typography variant="caption">
                <Trans>
                  With a voting power of{' '}
                  <FormattedNumber
                    value={powerAtProposalStart || 0}
                    variant="caption"
                    visibleDecimals={2}
                  />
                </Trans>
              </Typography>
            </Warning>
          )}
          {cannotVote && (
            <Warning severity="warning" sx={{ my: 2 }}>
              <Trans>Not enough voting power to participate in this proposal</Trans>
            </Warning>
          )}
          {canVote && (
            <>
              <Button
                color="success"
                variant="contained"
                fullWidth
                onClick={() => openGovVote(id, true, powerAtProposalStart)}
              >
                <Trans>Vote YAE</Trans>
              </Button>
              <Button
                color="error"
                variant="contained"
                fullWidth
                onClick={() => openGovVote(id, false, powerAtProposalStart)}
                sx={{ mt: 2 }}
              >
                <Trans>Vote NAY</Trans>
              </Button>
            </>
          )}
        </>
      ) : (
        <ConnectWalletButton />
      )}
    </>
  );
}
