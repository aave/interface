import { Box, Typography } from '@mui/material';
import { GovernancePageProps } from 'pages/governance';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { StateBadge } from './StateBadge';
import { formatProposal } from './utils/formatProposal';
import { VoteBar } from './VoteBar';

export function ProposalListItem({
  proposal,
  prerendered,
  ipfs,
}: GovernancePageProps['proposals'][0]) {
  const { nayPercent, yaePercent, nayVotes, yaeVotes } = formatProposal(proposal);
  return (
    <Box
      sx={{
        px: 6,
        py: 8,
        display: 'flex',
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
            sx: '100%',
            md: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Typography variant="h3">{ipfs.title}</Typography>
        <Box>
          <StateBadge state={proposal.state} />
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, pl: { sm: 0, md: 2 } }}>
        <VoteBar yae percent={yaePercent} votes={yaeVotes} sx={{ mb: 4 }} />
        <VoteBar percent={nayPercent} votes={nayVotes} />
      </Box>
    </Box>
  );
}
