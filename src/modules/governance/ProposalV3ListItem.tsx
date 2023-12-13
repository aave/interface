import { AccessLevel, ProposalV3State } from '@aave/contract-helpers';
import { Box, Stack, Typography } from '@mui/material';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { GOVERNANCE_PAGE } from 'src/utils/mixPanelEvents';

import { VoteBar } from './VoteBar';
import { StateBadge } from './StateBadge';
import { networkConfigs } from 'src/ui-config/networksConfig';

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
}) => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  const network = networkConfigs[votingChainId];
  const mightBeStale = false;

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
          <Typography variant="description" color="text.secondary">
            Ends in 3 days (TODO)
          </Typography>
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
        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <StateBadge state={proposal.state} loading={false} />
          <FormattedProposalTime
            state={0}
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
          {accessLevel === AccessLevel.Long_Executor ? (
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
        </Box> */}
      </Stack>
      <Stack
        flexGrow={1}
        direction="column"
        justifyContent="center"
        sx={{
          pl: { xs: 0, lg: 4 },
          mt: { xs: 7, lg: 0 },
        }}
      >
        <VoteBar yae percent={forPercent} votes={forVotes} sx={{ mb: 4 }} loading={mightBeStale} />
        <VoteBar percent={againstPercent} votes={againstVotes} loading={mightBeStale} />
      </Stack>
    </Box>
  );
};
