import { Trans } from '@lingui/macro';
import { Box, Paper, Skeleton, Typography } from '@mui/material';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { Proposal } from 'src/hooks/governance/useProposals';
import { ProposalVotes } from 'src/hooks/governance/useProposalVotes';

import { StateBadge } from '../StateBadge';
import { VoteBar } from '../VoteBar';
import { VotersListContainer } from './VotersListContainer';

interface VotingResultsPros {
  proposal?: Proposal;
  proposalVotes?: ProposalVotes;
  loading: boolean;
}

export const VotingResults = ({ proposal, loading, proposalVotes }: VotingResultsPros) => {
  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Typography variant="h3">
        <Trans>Voting results</Trans>
      </Typography>
      {proposal ? (
        <>
          <VoteBar
            yae
            percent={proposal.votingInfo.forPercent}
            votes={proposal.votingInfo.forVotes}
            sx={{ mt: 8 }}
            loading={loading}
          />
          <VoteBar
            percent={proposal.votingInfo.againstPercent}
            votes={proposal.votingInfo.againstVotes}
            sx={{ mt: 3 }}
            loading={loading}
          />
          {proposalVotes && (
            <VotersListContainer proposal={proposal.votingInfo} proposalVotes={proposalVotes} />
          )}
          <Row caption={<Trans>State</Trans>} sx={{ height: 48 }} captionVariant="description">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <StateBadge state={proposal.badgeState} loading={loading} />
              {/*
              <Box sx={{ mt: 0.5 }}>
                <FormattedProposalTime
                  state={proposal.proposalState}
                  startTimestamp={proposal.startTimestamp}
                  executionTime={proposal.executionTime}
                  expirationTimestamp={proposal.expirationTimestamp}
                  executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                />
              </Box>
              */}
            </Box>
          </Row>
          <Row caption={<Trans>Quorum</Trans>} sx={{ height: 48 }} captionVariant="description">
            <CheckBadge
              loading={loading}
              text={
                proposal.votingInfo.quorumReached ? (
                  <Trans>Reached</Trans>
                ) : (
                  <Trans>Not reached</Trans>
                )
              }
              checked={proposal.votingInfo.quorumReached}
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
                value={proposal.votingInfo.forVotes}
                visibleDecimals={2}
                roundDown
                sx={{ display: 'block' }}
              />

              <FormattedNumber
                variant="caption"
                value={proposal.votingInfo.quorum}
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
                proposal.votingInfo.differentialReached ? (
                  <Trans>Reached</Trans>
                ) : (
                  <Trans>Not reached</Trans>
                )
              }
              checked={proposal.votingInfo.differentialReached}
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
                value={proposal.votingInfo.currentDifferential}
                visibleDecimals={2}
                roundDown
                sx={{ display: 'block' }}
              />
              <FormattedNumber
                variant="caption"
                value={proposal.votingInfo.requiredDifferential}
                visibleDecimals={2}
                roundDown
                color="text.muted"
              />
            </Box>
          </Row>
          {/*
          <Row
            caption={<Trans>Total voting power</Trans>}
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <FormattedNumber
              value={normalize(proposal.totalVotingSupply, 18)}
              visibleDecimals={0}
              compact={false}
            />
          </Row>
*/}
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
