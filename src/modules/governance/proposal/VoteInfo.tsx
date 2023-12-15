import { ProposalState, ProposalV3State } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button, Paper, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { EnhancedProposal } from 'src/hooks/governance/useProposal';
import { useVoteOnProposal } from 'src/hooks/governance/useVoteOnProposal';
import { useVotingPowerAt } from 'src/hooks/governance/useVotingPowerAt';
import { useModalContext } from 'src/hooks/useModal';
import { CustomProposalType } from 'src/static-build/proposal';
import { useRootStore } from 'src/store/root';

interface VoteInfoProps {
  proposal: EnhancedProposal;
}

export function VoteInfo({ proposal }: VoteInfoProps) {
  const { openGovVote } = useModalContext();
  const user = useRootStore((state) => state.account);
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  // const { data: voteOnProposal } = useVoteOnProposal(currentMarketData, id);
  // const { data: powerAtProposalStart } = useVotingPowerAt(currentMarketData, strategy, startBlock);

  const voteOnProposal = {
    support: true
  }

  const powerAtProposalStart = 0

  const voteOngoing = proposal.proposalData.proposalData.state === ProposalV3State.Active;

  // Messages
  /*
  const didVote = powerAtProposalStart && voteOnProposal?.votingPower !== '0';
  const showAlreadyVotedMsg = !!user && voteOnProposal && didVote;
  */
  const didVote = true
  const showAlreadyVotedMsg = !!user && didVote

  const showCannotVoteMsg = !!user && voteOngoing && Number(powerAtProposalStart) === 0;
  const showCanVoteMsg =
    powerAtProposalStart && !didVote && !!user && voteOngoing && Number(powerAtProposalStart) !== 0;


  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Typography variant="h3" sx={{ mb: 8 }}>
        <Trans>Your voting info</Trans>
      </Typography>
      {user ? (
        <>
          {user && !didVote && !voteOngoing && (
            <Typography sx={{ textAlign: 'center' }} color="text.muted">
              <Trans>You did not participate in this proposal</Trans>
            </Typography>
          )}
          {user && voteOngoing && (
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
          {showAlreadyVotedMsg && (
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
          {showCannotVoteMsg && (
            <Warning severity="warning" sx={{ my: 2 }}>
              <Trans>Not enough voting power to participate in this proposal</Trans>
            </Warning>
          )}
          {showCanVoteMsg && (
            <>
              <Button
                color="success"
                variant="contained"
                fullWidth
                onClick={() => openGovVote(+proposal.proposal.proposalId, true, powerAtProposalStart)}
              >
                <Trans>Vote YAE</Trans>
              </Button>
              <Button
                color="error"
                variant="contained"
                fullWidth
                onClick={() => openGovVote(+proposal.proposal.proposalId, false, powerAtProposalStart)}
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
    </Paper>
  );
}
