import { VotingMachineProposalState } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Alert, AlertTitle, Box, Button, Paper, Typography } from '@mui/material';
import { constants } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useVotingPowerAt } from 'src/hooks/governance/useVotingPowerAt';
import { useModalContext } from 'src/hooks/useModal';
import { VoteProposalData } from 'src/modules/governance/types';
import { useRootStore } from 'src/store/root';
import { cardHeadingSx, cardPaddingSx } from 'src/utils/cardStyles';

import { networkConfigs } from '../../../ui-config/networksConfig';

interface VoteInfoProps {
  voteData: VoteProposalData;
}

export function VoteInfo({ voteData }: VoteInfoProps) {
  const { openGovVote } = useModalContext();
  const user = useRootStore((state) => state.account);
  const voteOnProposal = voteData.votedInfo;
  const votingChainId = voteData.votingMachineChainId;
  const network = networkConfigs[votingChainId];

  const blockHash =
    voteData.snapshotBlockHash === constants.HashZero ? 'latest' : voteData.snapshotBlockHash;

  const { data: powerAtProposalStart } = useVotingPowerAt(blockHash, voteData.votingAssets);

  const voteOngoing = voteData.votingState === VotingMachineProposalState.Active;

  const didVote = powerAtProposalStart && voteOnProposal && voteOnProposal.votingPower !== '0';
  const showAlreadyVotedMsg = !!user && voteOnProposal && didVote;

  const showCannotVoteMsg = !!user && voteOngoing && Number(powerAtProposalStart) === 0;
  const showCanVoteMsg =
    powerAtProposalStart && !didVote && !!user && voteOngoing && Number(powerAtProposalStart) !== 0;

  return (
    <Paper variant="card" sx={cardPaddingSx}>
      <Row
        sx={{ mb: 8 }}
        caption={
          <>
            <Typography variant="h3" sx={cardHeadingSx}>
              <Trans>Your voting info</Trans>
            </Typography>
            {network && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'fg-2',
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
            <Typography sx={{ textAlign: 'center' }} color="fg-3">
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
                  <Typography variant="caption" color="fg-2">
                    (AAVE + stkAAVE)
                  </Typography>
                </>
              }
            >
              <FormattedNumber value={powerAtProposalStart || 0} variant="h4" visibleDecimals={2} />
            </Row>
          )}
          {showAlreadyVotedMsg && voteOnProposal && (
            <Alert
              severity={voteOnProposal.support ? 'success' : 'error'}
              sx={{ width: '100%', my: 2 }}
            >
              <AlertTitle>
                <Trans>You voted {voteOnProposal.support ? 'YAE' : 'NAY'}</Trans>
              </AlertTitle>
              <Trans>
                With a voting power of{' '}
                <FormattedNumber
                  value={formatUnits(voteOnProposal.votingPower, 18) || 0}
                  variant="caption"
                  visibleDecimals={2}
                />
              </Trans>
            </Alert>
          )}
          {showCannotVoteMsg && (
            <Alert severity="warning" sx={{ width: '100%', my: 2 }}>
              <Trans>Not enough voting power to participate in this proposal</Trans>
            </Alert>
          )}
          {showCanVoteMsg && (
            <>
              <Button
                color="success"
                variant="contained"
                fullWidth
                onClick={() => openGovVote(voteData, true, powerAtProposalStart)}
                sx={{ mt: 4 }}
              >
                <Trans>Vote YAE</Trans>
              </Button>
              <Button
                color="error"
                variant="contained"
                fullWidth
                onClick={() => openGovVote(voteData, false, powerAtProposalStart)}
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
