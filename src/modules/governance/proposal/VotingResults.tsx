import { Trans } from "@lingui/macro";
import { Box, Paper, Skeleton, Typography } from "@mui/material";
import { VoteBar } from "../VoteBar";
import { VotersListContainer } from "./VotersListContainer";
import { Row } from "src/components/primitives/Row";
import { StateBadge } from "../StateBadge";
import { FormattedProposalTime } from "../FormattedProposalTime";
import { FormattedNumber } from "src/components/primitives/FormattedNumber";
import { CheckBadge } from "src/components/primitives/CheckBadge";
import { FormattedProposalV3 } from "../utils/formatProposal";
import { ProposalVotes } from "src/hooks/governance/useProposalVotes";

interface VotingResultsPros {
  proposal: FormattedProposalV3
  proposalVotes: ProposalVotes;
  loading: boolean
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
            percent={proposal.forPercent}
            votes={proposal.forVotes}
            sx={{ mt: 8 }}
            loading={loading}
          />
          <VoteBar percent={proposal.againstPercent} votes={proposal.againstVotes} sx={{ mt: 3 }} loading={loading} />
          <VotersListContainer proposal={proposal} proposalVotes={proposalVotes} />
          <Row
            caption={<Trans>State</Trans>}
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <StateBadge state={proposal.proposalState} loading={loading} />
              {
                /*
              <Box sx={{ mt: 0.5 }}>
                <FormattedProposalTime
                  state={proposal.proposalState}
                  startTimestamp={proposal.startTimestamp}
                  executionTime={proposal.executionTime}
                  expirationTimestamp={proposal.expirationTimestamp}
                  executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                />
              </Box>
              */
              }
            </Box>
          </Row>
          <Row
            caption={<Trans>Quorum</Trans>}
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <CheckBadge
              loading={loading}
              text={proposal.quorumReached ? <Trans>Reached</Trans> : <Trans>Not reached</Trans>}
              checked={proposal.quorumReached}
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
                value={proposal.forVotes}
                visibleDecimals={2}
                roundDown
                sx={{ display: 'block' }}
              />
              {
                /*
                <FormattedNumber
                  variant="caption"
                  value={minQuorumVotes}
                  visibleDecimals={2}
                  roundDown
                  color="text.muted"
                />
                */
              }
            </Box>
          </Row>
          <Row
            caption={<Trans>Differential</Trans>}
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <CheckBadge
              loading={loading}
              text={proposal.diffReached ? <Trans>Reached</Trans> : <Trans>Not reached</Trans>}
              checked={proposal.diffReached}
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
            {
              /*
            <Box sx={{ textAlign: 'right' }}>
              <FormattedNumber
                value={diff}
                visibleDecimals={2}
                roundDown
                sx={{ display: 'block' }}
              />
              <FormattedNumber
                variant="caption"
                value={requiredDiff}
                visibleDecimals={2}
                roundDown
                color="text.muted"
              />
              </Box>
              */
            }
          </Row>
          {
            /*
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
*/
          }
        </>
      ) : (
        <>
          <Skeleton height={28} sx={{ mt: 8 }} />
          <Skeleton height={28} sx={{ mt: 8 }} />
        </>
      )}
    </Paper>
  );
}