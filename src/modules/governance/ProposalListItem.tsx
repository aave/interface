import { ProposalState } from '@aave/contract-helpers';
import { AaveGovernanceV2 } from '@bgd-labs/aave-address-book';
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

export const stateBadgeMap = {
  Pending: 'New',
  Canceled: 'Canceled',
  Active: 'Voting Active',
  Failed: 'Failed',
  Succeeded: 'Passed',
  Queued: 'Queued',
  Expired: 'Expired',
  Executed: 'Executed',
};

export function ProposalListItem({
  proposal,
  prerendered,
  ipfs,
}: GovernancePageProps['proposals'][0]) {
  const { nayPercent, yaePercent, nayVotes, yaeVotes, quorumReached, diffReached } =
    formatProposal(proposal);
  const { palette } = useTheme();

  const delayedBridgeExecutors = [
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_ARBITRUM,
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_OPTIMISM,
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_POLYGON,
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_METIS,
  ];
  const lowercaseExecutors = delayedBridgeExecutors.map((str) => str.toLowerCase());

  let proposalCrosschainBridge = false;

  if (proposal.targets && proposal.targets.length > 0) {
    const hasDelayedExecutor = proposal.targets.filter((address) =>
      lowercaseExecutors.includes(address.toLowerCase())
    );
    if (hasDelayedExecutor.length > 0) {
      proposalCrosschainBridge = true;
    }
  }

  // Currently all cross-executors share this delay
  // TO-DO: invetigate if this can be changed, if so, query on-chain
  // const twoDayDelay = 172800 + 14400;
  const twoDayDelay = 172800 + 7200; // 180000 twoDays2hours
  // const twoDaysAndFourHours = 172800 + 14400;

  const executedL2 =
    proposal.executionTime === 0
      ? false
      : Math.floor(Date.now() / 1000) > proposal.executionTime + twoDayDelay;

  const mightBeStale = prerendered && !isProposalStateImmutable(proposal);

  const executorChain = proposalCrosschainBridge ? 'L2' : 'L1';

  const pendingL2 = proposalCrosschainBridge && !executedL2;

  const displayL2StateBadge =
    executorChain === 'L2' &&
    proposal.state !== 'Failed' &&
    proposal.state !== 'Canceled' &&
    proposal.state === 'Executed' &&
    (executedL2 || pendingL2);

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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            // alignItems: 'center',
            gap: 3,
          }}
        >
          <Box>
            <StateBadge
              sx={{ marginRight: 2 }}
              state={stateBadgeMap[proposal.state]}
              // crossChainBridge={'L1'}
              loading={mightBeStale}
            />

            <FormattedProposalTime
              state={proposal.state}
              startTimestamp={proposal.startTimestamp}
              executionTime={proposal.executionTime}
              expirationTimestamp={proposal.expirationTimestamp}
              executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
              l2Execution={displayL2StateBadge}
            />
          </Box>
          <Box>
            {displayL2StateBadge && pendingL2 && (
              <>
                <StateBadge
                  sx={{ marginRight: 2 }}
                  // crossChainBridge={executorChain}
                  state={pendingL2 ? ProposalState.Pending : ProposalState.Executed}
                  loading={mightBeStale}
                />

                <FormattedProposalTime
                  state={proposal.state}
                  startTimestamp={proposal.startTimestamp}
                  executionTime={proposal.executionTime + twoDayDelay}
                  expirationTimestamp={proposal.expirationTimestamp}
                  executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                  l2Execution={displayL2StateBadge}
                />
              </>
            )}
          </Box>

          {proposal.executor === AaveGovernanceV2.LONG_EXECUTOR ? (
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
      <Box></Box>
      <Box
        sx={{
          flexGrow: 1,
          pl: { xs: 0, lg: 4 },
          mt: { xs: 7, lg: 0 },
        }}
      >
        <VoteBar yae percent={yaePercent} votes={yaeVotes} sx={{ mb: 4 }} loading={mightBeStale} />
        <VoteBar percent={nayPercent} votes={nayVotes} loading={mightBeStale} />
        <Box
          display="flex"
          sx={{
            mt: 3,
          }}
        >
          <CheckBadge text={<Trans>Quorum</Trans>} checked={quorumReached} loading={mightBeStale} />
          <CheckBadge
            text={<Trans>Differential</Trans>}
            checked={diffReached}
            loading={mightBeStale}
          />
        </Box>
      </Box>
    </Box>
  );
}
