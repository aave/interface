import { ProposalState } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { CustomProposalType } from 'src/static-build/proposal';

export function VoteInfo({ id, state, strategy, startBlock }: CustomProposalType) {
  const { openGovVote } = useModalContext();
  const { currentAccount } = useWeb3Context();

  const [votedPower, setVotedPower] = useState<string>();
  const [support, setSupport] = useState<boolean>();
  const [didVote, setDidVote] = useState<boolean>();
  const [power, setPower] = useState<string>('0');

  const { governanceService } = useGovernanceDataProvider();
  const voteOngoing = state === ProposalState.Active;

  const fetchCurrentVote = async () => {
    try {
      const { support, votingPower } = await governanceService.getVoteOnProposal({
        user: currentAccount,
        proposalId: id,
      });

      if (votingPower && votingPower.toString() !== '0') {
        setSupport(support);
        setVotedPower(normalize(votingPower.toString(), 18));
        setDidVote(true);
      } else {
        setDidVote(false);
      }
    } catch (e) {
      console.log('error fetching vote info', e);
    }
  };

  const fetchVotingPower = async () => {
    try {
      const power = await governanceService.getVotingPowerAt({
        user: currentAccount,
        block: startBlock,
        strategy,
      });
      setPower(power);
    } catch (e) {
      console.log('error fetching voting power for proposal', id);
    }
  };

  useEffect(() => {
    if (!currentAccount) {
      setSupport(undefined);
      setDidVote(undefined);
      setVotedPower(undefined);
      setPower('0');
    } else {
      fetchCurrentVote();
      fetchVotingPower();
    }
  }, [voteOngoing, currentAccount, startBlock]);

  console.log(power);

  return (
    <>
      <Typography variant="h3" sx={{ mb: 8 }}>
        <Trans>Your voting info</Trans>
      </Typography>
      {currentAccount && !didVote && !voteOngoing && (
        <Typography sx={{ textAlign: 'center' }} color="text.muted">
          <Trans>You did not participate in this proposal</Trans>
        </Typography>
      )}
      {currentAccount && voteOngoing && (
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
          <FormattedNumber value={power || 0} variant="main16" visibleDecimals={2} />
        </Row>
      )}
      {currentAccount && didVote && (
        <Alert severity={support ? 'success' : 'error'} sx={{ my: 2 }}>
          <Typography variant="subheader1">
            <Trans>You voted {support ? 'YAE' : 'NAY'}</Trans>
          </Typography>
          <Typography variant="caption">
            <Trans>
              With a voting power of{' '}
              <FormattedNumber value={votedPower || 0} variant="caption" visibleDecimals={2} />
            </Trans>
          </Typography>
        </Alert>
      )}
      {currentAccount && voteOngoing && Number(power) === 0 && (
        <Alert severity="warning" sx={{ my: 2 }}>
          <Trans>Not enough voting power to participate in this proposal</Trans>
        </Alert>
      )}
      {currentAccount && voteOngoing && Number(power) !== 0 && (
        <>
          <Button
            color="success"
            variant="contained"
            fullWidth
            onClick={() => openGovVote(id, true, power)}
            disabled={support === true}
          >
            <Trans>Vote YAE</Trans>
          </Button>
          <Button
            color="error"
            variant="contained"
            fullWidth
            onClick={() => openGovVote(id, false, power)}
            disabled={support === false}
            sx={{ mt: 2 }}
          >
            <Trans>Vote NAY</Trans>
          </Button>
        </>
      )}
      {!currentAccount && <ConnectWalletButton />}
    </>
  );
}
