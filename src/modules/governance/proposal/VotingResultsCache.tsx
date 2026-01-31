import { Trans } from '@lingui/macro';
import { Box, Paper, Skeleton, Typography } from '@mui/material';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ProposalDetail, ProposalVote } from 'src/services/GovernanceCacheService';

import { ProposalBadgeState, StateBadge } from '../StateBadge';
import { VoteBar } from '../VoteBar';
import { VotersListCacheContainer } from './VotersListCacheContainer';

function mapStateToBadge(state: string): ProposalBadgeState {
  switch (state) {
    case 'created':
      return ProposalBadgeState.Created;
    case 'active':
      return ProposalBadgeState.OpenForVoting;
    case 'queued':
      return ProposalBadgeState.Passed;
    case 'executed':
      return ProposalBadgeState.Executed;
    case 'failed':
      return ProposalBadgeState.Failed;
    case 'cancelled':
      return ProposalBadgeState.Cancelled;
    default:
      return ProposalBadgeState.Created;
  }
}

function formatVotes(votes: string): number {
  const raw = parseFloat(votes) || 0;
  return raw / 1e18;
}

function calculateVoteInfo(
  votesFor: string,
  votesAgainst: string,
  quorum: string | null,
  requiredDifferential: string | null
) {
  const forVotes = formatVotes(votesFor);
  const againstVotes = formatVotes(votesAgainst);
  const total = forVotes + againstVotes;

  // Quorum is stored in whole token units (e.g., 320000 = 320K tokens)
  const quorumValue = quorum ? parseFloat(quorum) : 0;
  const differentialValue = requiredDifferential ? parseFloat(requiredDifferential) : 0;

  // Current differential is forVotes - againstVotes
  const currentDifferential = forVotes - againstVotes;

  return {
    forVotes,
    againstVotes,
    forPercent: total > 0 ? (forVotes / total) * 100 : 0,
    againstPercent: total > 0 ? (againstVotes / total) * 100 : 0,
    quorum: quorumValue,
    quorumReached: forVotes >= quorumValue,
    requiredDifferential: differentialValue,
    currentDifferential,
    differentialReached: currentDifferential >= differentialValue,
  };
}

interface VotingResultsCacheProps {
  proposal?: ProposalDetail | null;
  yaeVotes: ProposalVote[];
  nayVotes: ProposalVote[];
  loading: boolean;
  votesLoading: boolean;
}

export const VotingResultsCache = ({
  proposal,
  yaeVotes,
  nayVotes,
  loading,
  votesLoading,
}: VotingResultsCacheProps) => {
  const voteInfo = proposal
    ? calculateVoteInfo(
        proposal.votesFor,
        proposal.votesAgainst,
        proposal.quorum,
        proposal.requiredDifferential
      )
    : null;
  const badgeState = proposal ? mapStateToBadge(proposal.state) : ProposalBadgeState.Created;

  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Typography variant="h3">
        <Trans>Voting results</Trans>
      </Typography>
      {proposal && voteInfo ? (
        <>
          <VoteBar
            yae
            percent={voteInfo.forPercent}
            votes={voteInfo.forVotes}
            sx={{ mt: 8 }}
            loading={loading}
          />
          <VoteBar
            percent={voteInfo.againstPercent}
            votes={voteInfo.againstVotes}
            sx={{ mt: 3 }}
            loading={loading}
          />
          <VotersListCacheContainer
            yaeVotes={yaeVotes}
            nayVotes={nayVotes}
            loading={votesLoading}
            forVotes={voteInfo.forVotes}
            againstVotes={voteInfo.againstVotes}
          />
          <Row caption={<Trans>State</Trans>} sx={{ height: 48 }} captionVariant="description">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <StateBadge state={badgeState} loading={loading} />
            </Box>
          </Row>
          <Row caption={<Trans>Quorum</Trans>} sx={{ height: 48 }} captionVariant="description">
            <CheckBadge
              loading={loading}
              text={voteInfo.quorumReached ? <Trans>Reached</Trans> : <Trans>Not reached</Trans>}
              checked={voteInfo.quorumReached}
              sx={{ height: 48 }}
              variant="description"
            />
          </Row>
          <Row
            caption={
              <>
                <Trans>Current votes</Trans>
                <Typography variant="caption" color="text.muted">
                  Required
                </Typography>
              </>
            }
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <Box sx={{ textAlign: 'right' }}>
              <FormattedNumber
                value={voteInfo.forVotes}
                visibleDecimals={2}
                roundDown
                sx={{ display: 'block' }}
              />
              <FormattedNumber
                variant="caption"
                value={voteInfo.quorum}
                visibleDecimals={2}
                roundDown
                color="text.muted"
              />
            </Box>
          </Row>
          <Row
            caption={<Trans>Differential</Trans>}
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <CheckBadge
              loading={loading}
              text={
                voteInfo.differentialReached ? <Trans>Reached</Trans> : <Trans>Not reached</Trans>
              }
              checked={voteInfo.differentialReached}
              sx={{ height: 48 }}
              variant="description"
            />
          </Row>
          <Row
            caption={
              <>
                <Trans>Current differential</Trans>
                <Typography variant="caption" color="text.muted">
                  Required
                </Typography>
              </>
            }
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <Box sx={{ textAlign: 'right' }}>
              <FormattedNumber
                value={voteInfo.currentDifferential}
                visibleDecimals={2}
                roundDown
                sx={{ display: 'block' }}
              />
              <FormattedNumber
                variant="caption"
                value={voteInfo.requiredDifferential}
                visibleDecimals={2}
                roundDown
                color="text.muted"
              />
            </Box>
          </Row>
        </>
      ) : (
        <>
          <Skeleton height={28} sx={{ mt: 8 }} />
          <Skeleton height={28} sx={{ mt: 8 }} />
        </>
      )}
    </Paper>
  );
};
