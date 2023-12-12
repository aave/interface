import { AccessLevel, ProposalV3State } from '@aave/contract-helpers';
import { ShieldExclamationIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { GOVERNANCE_PAGE } from 'src/utils/mixPanelEvents';

import { VoteBar } from './VoteBar';

export const ProposalV3ListItem = ({
  id,
  title,
  proposalState,
  forVotes,
  againstVotes,
  forPercent,
  againstPercent,
  quorumReached,
  diffReached,
  accessLevel,
}: {
  id: string;
  title: string;
  proposalState: ProposalV3State;
  accessLevel: AccessLevel;
  forVotes: number;
  againstVotes: number;
  quorumReached: boolean;
  diffReached: boolean;
  forPercent: number;
  againstPercent: number;
}) => {
  // const { nayPercent, yaePercent, nayVotes, yaeVotes, quorumReached, diffReached } =
  //   formatProposal(proposal);
  const { palette } = useTheme();
  const trackEvent = useRootStore((store) => store.trackEvent);

  const mightBeStale = false;

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
      onClick={() => trackEvent(GOVERNANCE_PAGE.VIEW_AIP, { AIP: id })}
      href={ROUTES.dynamicRenderedProposal(+id)}
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
          {title} - proposal id: {id}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          {/* <StateBadge state={proposal.state} loading={false} />
          <FormattedProposalTime
            state={0}
            startTimestamp={proposal.startTimestamp}
            executionTime={proposal.executionTime}
            expirationTimestamp={proposal.expirationTimestamp}
            executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
          /> */}
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
        </Box>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          pl: { xs: 0, lg: 4 },
          mt: { xs: 7, lg: 0 },
        }}
      >
        <VoteBar yae percent={forPercent} votes={forVotes} sx={{ mb: 4 }} loading={mightBeStale} />
        <VoteBar percent={againstPercent} votes={againstVotes} loading={mightBeStale} />
      </Box>
    </Box>
  );
};
