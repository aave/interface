import { ProposalV3State } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Proposal } from 'src/hooks/governance/useProposals';
import { useRootStore } from 'src/store/root';
import { GOVERNANCE_PAGE } from 'src/utils/mixPanelEvents';

import { StateBadge } from './StateBadge';
import { getProposalVoteInfo } from './utils/formatProposal';
import { VoteBar } from './VoteBar';

dayjs.extend(relativeTime);

export const ProposalV3ListItem = ({ proposal }: { proposal: Proposal }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  const timestamp = getProposalTimestamp(proposal);
  const votingInfo = getProposalVoteInfo(proposal);

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
      onClick={() => trackEvent(GOVERNANCE_PAGE.VIEW_AIP, { AIP: proposal.id })}
      href={ROUTES.dynamicRenderedProposal(+proposal.id)}
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
          <StateBadge state={proposal.state} loading={false} />

          {proposal.state === ProposalV3State.Created && (
            <>
              <Typography variant="description" color="text.secondary">
                <Trans>starts</Trans> {timestamp}
              </Typography>
            </>
          )}
          {proposal.state === ProposalV3State.Active && (
            <>
              <Typography variant="description" color="text.secondary">
                <Trans>ends</Trans> {timestamp}
              </Typography>
            </>
          )}
        </Stack>
        <Typography variant="h3" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {proposal.proposalMetadata.title}
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
          percent={votingInfo.forPercent}
          votes={votingInfo.forVotes}
          sx={{ mb: 4 }}
          compact
        />
        <VoteBar percent={votingInfo.againstPercent} votes={votingInfo.againstVotes} compact />
      </Stack>
    </Box>
  );
};

const getProposalTimestamp = (proposal: Proposal) => {
  const state = proposal.state;
  const creationTime = Number(proposal.transactions.created.timestamp);
  const votingMachineStartTime = Number(proposal.transactions.active?.timestamp || 0);
  if (state === ProposalV3State.Created || votingMachineStartTime === 0) {
    const votingStartDelay = proposal.votingConfig.cooldownBeforeVotingStart;
    return dayjs.unix(creationTime + Number(votingStartDelay)).fromNow();
  }

  if (state === ProposalV3State.Active) {
    const votingDuration = proposal.votingConfig.votingDuration;
    return dayjs.unix(votingMachineStartTime + Number(votingDuration)).fromNow();
  }

  // only showing timestamps for created/active proposals for now
  return '';
};
