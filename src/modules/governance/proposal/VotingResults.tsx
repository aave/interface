import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Skeleton, SvgIcon, Typography } from '@mui/material';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { ProposalDetailDisplay, VotersSplitDisplay } from 'src/modules/governance/types';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

import { StateBadge } from '../StateBadge';
import { VoteBar } from '../VoteBar';
import { VotersListContainer } from './VotersListContainer';

interface VotingResultsProps {
  proposal?: ProposalDetailDisplay | null;
  voters?: VotersSplitDisplay;
  loading: boolean;
  votesLoading?: boolean;
}

export const VotingResults = ({ proposal, loading, voters, votesLoading }: VotingResultsProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  const discussionUrl = proposal?.discussions?.match(/https?:\/\/[^\s"]+/)?.[0];
  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Typography variant="h3">
        <Trans>Voting results</Trans>
      </Typography>
      {proposal ? (
        <>
          <VoteBar
            yae
            percent={proposal.voteInfo.forPercent}
            votes={proposal.voteInfo.forVotes}
            sx={{ mt: 8 }}
            loading={loading}
          />
          <VoteBar
            percent={proposal.voteInfo.againstPercent}
            votes={proposal.voteInfo.againstVotes}
            sx={{ mt: 3 }}
            loading={loading}
          />
          {voters && !votesLoading && (
            <VotersListContainer voteInfo={proposal.voteInfo} voters={voters} />
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
            </Box>
          </Row>
          <Row caption={<Trans>Quorum</Trans>} sx={{ height: 48 }} captionVariant="description">
            <CheckBadge
              loading={loading}
              text={
                proposal.voteInfo.quorumReached ? (
                  <Trans>Reached</Trans>
                ) : (
                  <Trans>Not reached</Trans>
                )
              }
              checked={proposal.voteInfo.quorumReached}
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
                value={proposal.voteInfo.forVotes}
                visibleDecimals={2}
                roundDown
                sx={{ display: 'block' }}
              />
              <FormattedNumber
                variant="caption"
                value={proposal.voteInfo.quorum}
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
                proposal.voteInfo.differentialReached ? (
                  <Trans>Reached</Trans>
                ) : (
                  <Trans>Not reached</Trans>
                )
              }
              checked={proposal.voteInfo.differentialReached}
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
                value={proposal.voteInfo.currentDifferential}
                visibleDecimals={2}
                roundDown
                sx={{ display: 'block' }}
              />
              <FormattedNumber
                variant="caption"
                value={proposal.voteInfo.requiredDifferential}
                visibleDecimals={2}
                roundDown
                color="text.muted"
              />
            </Box>
          </Row>
          {discussionUrl && (
            <Button
              component={Link}
              target="_blank"
              rel="noopener"
              onClick={() =>
                trackEvent(GENERAL.EXTERNAL_LINK, {
                  AIP: proposal.id,
                  Link: 'Forum Discussion',
                })
              }
              href={discussionUrl}
              variant="outlined"
              fullWidth
              endIcon={
                <SvgIcon>
                  <ExternalLinkIcon />
                </SvgIcon>
              }
              sx={{ mt: 4 }}
            >
              <Trans>Forum discussion</Trans>
            </Button>
          )}
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
