import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { GovernancePageProps } from 'pages/governance';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { Link, ROUTES } from 'src/components/primitives/Link';

import { FormattedProposalTime } from './FormattedProposalTime';
import { StateBadge } from './StateBadge';
import { formatProposal } from './utils/formatProposal';
import { VoteBar } from './VoteBar';

export function ProposalListItem({
  proposal,
  prerendered,
  ipfs,
}: GovernancePageProps['proposals'][0]) {
  const { nayPercent, yaePercent, nayVotes, yaeVotes, quorumReached, diffReached } =
    formatProposal(proposal);
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
            sm: '60%',
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h3" gutterBottom sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ipfs.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <StateBadge state={proposal.state} />
          <FormattedProposalTime
            state={proposal.state}
            executionTime={proposal.executionTime}
            expirationTimestamp={proposal.expirationTimestamp}
          />
          <CheckBadge text={<Trans>Quorum</Trans>} checked={quorumReached} />
          <CheckBadge text={<Trans>Differential</Trans>} checked={diffReached} />
        </Box>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          pl: { xs: 0, sm: 4 },
        }}
      >
        <VoteBar yae percent={yaePercent} votes={yaeVotes} sx={{ mb: 4 }} />
        <VoteBar percent={nayPercent} votes={nayVotes} />
      </Box>
    </Box>
  );
}
