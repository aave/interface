import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Proposal } from 'src/hooks/governance/useProposals';
import { useRootStore } from 'src/store/root';
import { GOVERNANCE_PAGE } from 'src/utils/mixPanelEvents';

import { StateBadge } from './StateBadge';
import { VoteBar } from './VoteBar';

dayjs.extend(relativeTime);

export const ProposalV3ListItem = ({ proposal }: { proposal: Proposal }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  return (
    <Box
      sx={{
        p: 6,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      }}
      component={Link}
      onClick={() => trackEvent(GOVERNANCE_PAGE.VIEW_AIP, { AIP: proposal.subgraphProposal.id })}
      href={ROUTES.dynamicRenderedProposal(+proposal.subgraphProposal.id)}
    >
      <Stack
        direction="column"
        gap={2}
        sx={{
          width: {
            xs: '100%',
            lg: '70%',
          },
          pr: { xs: 0, lg: 8 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" gap={3} alignItems="center">
          <StateBadge state={proposal.badgeState} loading={false} />
        </Stack>
        <Typography variant="h3" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {proposal.subgraphProposal.proposalMetadata.title}
        </Typography>
      </Stack>
      <Stack
        flexGrow={1}
        direction="column"
        justifyContent="center"
        sx={{
          pl: { xs: 0, lg: 18 },
          mt: { xs: 7, lg: 0 },
        }}
      >
        <VoteBar
          yae
          percent={proposal.votingInfo.forPercent}
          votes={proposal.votingInfo.forVotes}
          sx={{ mb: 4 }}
          compact
        />
        <VoteBar
          percent={proposal.votingInfo.againstPercent}
          votes={proposal.votingInfo.againstVotes}
          compact
        />
      </Stack>
    </Box>
  );
};
