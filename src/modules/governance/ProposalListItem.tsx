import { ShieldExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';
import { GovernancePageProps } from 'pages/governance/index.governance';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { Link, ROUTES } from 'src/components/primitives/Link';

import { FormattedProposalTime } from './FormattedProposalTime';
import { StateBadge } from './StateBadge';
import { formatProposal } from './utils/formatProposal';
import { isProposalStateImmutable } from './utils/immutableStates';
import { VoteBar } from './VoteBar';

export function ProposalListItem({
  proposal,
  prerendered,
  ipfs,
}: GovernancePageProps['proposals'][0]) {
  const { nayPercent, yaePercent, nayVotes, yaeVotes, quorumReached, diffReached, minQuorumVotes } =
    formatProposal(proposal);
  const { palette } = useTheme();

  const mightBeStale = prerendered && !isProposalStateImmutable(proposal);
  return (
    <Box
      sx={{
        px: 6,
        py: 8,
        display: 'flex',
        flexWrap: 'wrap',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      component={Link}
      href={
        prerendered
          ? ROUTES.prerenderedProposal(proposal.id)
          : ROUTES.dynamicRenderedProposal(proposal.id)
      }
    >
      <Box
        sx={{
          width: {
            xs: '100%',
            lg: '70%',
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ipfs.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <StateBadge state={proposal.state} loading={mightBeStale} />
          <FormattedProposalTime
            state={proposal.state}
            startTimestamp={proposal.startTimestamp}
            executionTime={proposal.executionTime}
            expirationTimestamp={proposal.expirationTimestamp}
            executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
          />
          <CheckBadge text={<Trans>Quorum</Trans>} checked={quorumReached} loading={mightBeStale} />
          <CheckBadge
            text={<Trans>Differential</Trans>}
            checked={diffReached}
            loading={mightBeStale}
          />
          {minQuorumVotes === 1040000 ? ( // Long executor
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subheader2" component="span" sx={{ mr: 1 }}>
                Long Executor
              </Typography>
              <ShieldExclamationIcon
                color={quorumReached ? palette.success.main : palette.warning.main}
                height="16"
              />
            </Box>
          ) : null}
        </Box>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          pl: { xs: 0, lg: 4 },
          mt: { xs: 7, lg: 0 },
        }}
      >
        <VoteBar yae percent={yaePercent} votes={yaeVotes} sx={{ mb: 4 }} loading={mightBeStale} />
        <VoteBar percent={nayPercent} votes={nayVotes} loading={mightBeStale} />
      </Box>
    </Box>
  );
}
