import { ProposalState } from '@aave/contract-helpers';
import { AaveGovernanceV2 } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
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
  const { nayPercent, yaePercent, nayVotes, yaeVotes, quorumReached, diffReached } =
    formatProposal(proposal);

  const delayedBridgeExecutors = [
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_ARBITRUM,
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_OPTIMISM,
    AaveGovernanceV2.CROSSCHAIN_FORWARDER_POLYGON,
  ];

  let proposalCrosschainBridge = false;

  if (proposal.targets && proposal.targets.length > 0) {
    const hasDelayedExecutor = proposal.targets.filter((address) =>
      delayedBridgeExecutors.includes(address)
    );
    if (hasDelayedExecutor.length > 0) {
      // exectutionTimeStamp = executionTime + 172800; // Adds time for cross bridge execution
      proposalCrosschainBridge = true;
    }
  }

  // Note: We assume that the proposal will be executed two days later and add 3 hour buffer
  const twoDayDelay = 172800;

  const executedL2 =
    proposal.executionTime > 0
      ? proposal.executionTime + twoDayDelay > proposal.executionTime
      : false;

  const mightBeStale = prerendered && !isProposalStateImmutable(proposal);

  const executorChain = proposalCrosschainBridge ? 'L2' : 'L1';
  const pendingL2 =
    proposalCrosschainBridge && proposal.executionTime === 0 && proposal.state !== 'Canceled';

  const proposalState =
    proposalCrosschainBridge && pendingL2 ? ProposalState.Pending : proposal.state;

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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
          <StateBadge state={proposal.state} crossChainBridge={'L1'} loading={mightBeStale} />
          {executorChain === 'L2' && executedL2 ? (
            <StateBadge
              crossChainBridge={executorChain}
              state={proposalState}
              loading={mightBeStale}
            />
          ) : (
            ''
          )}

          {executorChain === 'L2' && pendingL2 ? (
            <StateBadge
              crossChainBridge={executorChain}
              state={proposalState}
              loading={mightBeStale}
            />
          ) : (
            ''
          )}

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
