import { VotingMachineProposalState } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography } from '@mui/material';
import { constants } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { Proposal } from 'src/hooks/governance/useProposals';
import { useVotingPowerAt } from 'src/hooks/governance/useVotingPowerAt';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';

import { networkConfigs } from '../../../ui-config/networksConfig';

interface VoteInfoProps {
  proposal: Proposal;
}

export function VoteInfo({ proposal }: VoteInfoProps) {
  const { openGovVote } = useModalContext();
  const user = useRootStore((state) => state.account);
  const voteOnProposal = proposal.votingMachineData.votedInfo;
  const votingChainId = proposal.subgraphProposal.votingPortal.votingMachineChainId;
  const network = networkConfigs[votingChainId];

  const blockHash =
    proposal.subgraphProposal.snapshotBlockHash === constants.HashZero
      ? 'latest'
      : proposal.subgraphProposal.snapshotBlockHash;

  const { data: powerAtProposalStart } = useVotingPowerAt(
    blockHash,
    proposal.votingMachineData.votingAssets
  );

  const voteOngoing = proposal.votingMachineData.state === VotingMachineProposalState.Active;

  const didVote = powerAtProposalStart && voteOnProposal?.votingPower !== '0';
  const showAlreadyVotedMsg = !!user && voteOnProposal && didVote;

  const showCannotVoteMsg = !!user && voteOngoing && Number(powerAtProposalStart) === 0;
  const showCanVoteMsg =
    powerAtProposalStart && !didVote && !!user && voteOngoing && Number(powerAtProposalStart) !== 0;

  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Row
        sx={{ mb: 8 }}
        caption={
          <>
            <Typography variant="h3">
              <Trans>Your voting info</Trans>
            </Typography>
            {network && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.secondary',
                }}
              >
                <Typography variant="caption">
                  <Trans>Voting is on</Trans>
                </Typography>
                <Box
                  sx={{
                    height: 16,
                    width: 16,
                    ml: 1,
                    mr: 1,
                    mb: 1,
                  }}
                >
                  <img
                    src={network.networkLogoPath}
                    alt="network logo"
                    style={{ height: '100%', width: '100%' }}
                  />
                </Box>
                <Typography variant="caption">{network?.displayName}</Typography>
              </Box>
            )}
          </>
        }
      />
      {user ? (
        <>
          {user && !didVote && !voteOngoing && (
            <Typography sx={{ textAlign: 'center' }} color="text.muted">
              <Trans>You did not participate in this proposal</Trans>
            </Typography>
          )}
          {user && voteOngoing && (
            <Row
              caption={
                <>
                  <Typography variant="description">
                    <Trans>Voting power</Trans>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (AAVE + stkAAVE)
                  </Typography>
                </>
              }
            >
              <FormattedNumber
                value={powerAtProposalStart || 0}
                variant="main16"
                visibleDecimals={2}
              />
            </Row>
          )}
          {showAlreadyVotedMsg && (
            <Warning severity={voteOnProposal.support ? 'success' : 'error'} sx={{ my: 2 }}>
              <Typography variant="subheader1">
                <Trans>You voted {voteOnProposal.support ? 'YAE' : 'NAY'}</Trans>
              </Typography>
              <Typography variant="caption">
                <Trans>
                  With a voting power of{' '}
                  <FormattedNumber
                    value={formatUnits(proposal.votingMachineData.votedInfo.votingPower, 18) || 0}
                    variant="caption"
                    visibleDecimals={2}
                  />
                </Trans>
              </Typography>
            </Warning>
          )}
          {showCannotVoteMsg && (
            <Warning severity="warning" sx={{ my: 2 }}>
              <Trans>Not enough voting power to participate in this proposal</Trans>
            </Warning>
          )}
          {showCanVoteMsg && (
            <>
              <Button
                color="success"
                variant="contained"
                fullWidth
                onClick={() => openGovVote(proposal, true, powerAtProposalStart)}
              >
                <Trans>Vote YAE</Trans>
              </Button>
              <Button
                color="error"
                variant="contained"
                fullWidth
                onClick={() => openGovVote(proposal, false, powerAtProposalStart)}
                sx={{ mt: 2 }}
              >
                <Trans>Vote NAY</Trans>
              </Button>
            </>
          )}
        </>
      ) : (
        <ConnectWalletButton />
      )}
    </Paper>
  );
}
