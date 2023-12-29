import {
  ProposalData,
  ProposalV3State,
  VotingConfig,
  VotingMachineProposal,
} from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { networkConfigs } from 'src/ui-config/networksConfig';
import { GOVERNANCE_PAGE } from 'src/utils/mixPanelEvents';

import { StateBadge } from './StateBadge';
import { VoteBar } from './VoteBar';

dayjs.extend(relativeTime);

export const ProposalV3ListItem = ({
  id,
  title,
  shortDescription,
  proposalState,
  forVotes,
  againstVotes,
  forPercent,
  againstPercent,
  votingChainId,
  proposalData,
  votingMachineData,
  votingConfig,
}: {
  id: string;
  title: string;
  shortDescription: string;
  proposalState: ProposalV3State;
  forVotes: number;
  againstVotes: number;
  forPercent: number;
  againstPercent: number;
  votingChainId: number;
  proposalData: ProposalData;
  votingMachineData: VotingMachineProposal;
  votingConfig: VotingConfig;
}) => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  const network = networkConfigs[votingChainId];

  const timestamp = getProposalTimestamp(proposalData, votingMachineData, votingConfig);

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
      onClick={() => trackEvent(GOVERNANCE_PAGE.VIEW_AIP, { AIP: id })}
      href={ROUTES.dynamicRenderedProposal(+id)}
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
          <StateBadge state={proposalState} loading={false} />
          <Box
            sx={{
              height: 16,
              width: 16,
            }}
          >
            <img src={network.networkLogoPath} height="100%" width="100%" alt="network logo" />
          </Box>
          {proposalState === ProposalV3State.Created && (
            <>
              <Typography variant="description" color="text.secondary">
                <Trans>starts</Trans> {timestamp}
              </Typography>
            </>
          )}
          {proposalState === ProposalV3State.Active && (
            <>
              <Typography variant="description" color="text.secondary">
                <Trans>ends</Trans> {timestamp}
              </Typography>
            </>
          )}
        </Stack>
        <Typography variant="h3" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </Typography>
        <Typography
          variant="description"
          color="text.secondary"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: '2',
            WebkitBoxOrient: 'vertical',
          }}
        >
          {shortDescription}
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
        <VoteBar yae percent={forPercent} votes={forVotes} sx={{ mb: 4 }} compact />
        <VoteBar percent={againstPercent} votes={againstVotes} compact />
      </Stack>
    </Box>
  );
};

const getProposalTimestamp = (
  proposalData: ProposalData,
  votingMachineData: VotingMachineProposal,
  votingConfig: VotingConfig
) => {
  const state = proposalData.proposalData.state;
  const creationTime = proposalData.proposalData.creationTime;
  const votingMachineStartTime = votingMachineData.proposalData.startTime;
  if (state === ProposalV3State.Created || votingMachineStartTime === 0) {
    const votingStartDelay = votingConfig.config.coolDownBeforeVotingStart;
    return dayjs.unix(creationTime + Number(votingStartDelay)).fromNow();
  }

  if (state === ProposalV3State.Active) {
    const votingDuration = votingConfig.config.votingDuration;
    return dayjs.unix(votingMachineStartTime + Number(votingDuration)).fromNow();
  }

  // only showing timestamps for created/active proposals for now
  return '';
};
