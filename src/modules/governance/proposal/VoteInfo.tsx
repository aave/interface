import { ProposalState } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { CustomProposalType } from 'src/static-build/proposal';
import { useRootStore } from 'src/store/root';

export function VoteInfo({ id, state, strategy, startBlock }: CustomProposalType) {
  const { openGovVote } = useModalContext();
  const { currentAccount } = useWeb3Context();

  const [votedPower, setVotedPower] = useState<string>();
  const [support, setSupport] = useState<boolean>();
  const [didVote, setDidVote] = useState<boolean>();
  const [power, setPower] = useState<string>('0');

  const [getVoteOnProposal, getVotingPowerAt] = useRootStore((state) => [
    state.getVoteOnProposal,
    state.getVotingPowerAt,
  ]);
  const voteOngoing = state === ProposalState.Active;

  // Messages
  const showAlreadyVotedMsg = currentAccount && didVote;
  const showCannotVoteMsg = currentAccount && voteOngoing && Number(power) === 0;
  const showCanVoteMsg = !didVote && currentAccount && voteOngoing && Number(power) !== 0;

  const fetchCurrentVote = async () => {
    try {
      const { support, votingPower } = await getVoteOnProposal({
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
      const power = await getVotingPowerAt({
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
      {showAlreadyVotedMsg && (
        <Warning severity={support ? 'success' : 'error'} sx={{ my: 2 }}>
          <Typography variant="subheader1">
            <Trans>You voted {support ? 'YAE' : 'NAY'}</Trans>
          </Typography>
          <Typography variant="caption">
            <Trans>
              With a voting power of{' '}
              <FormattedNumber value={votedPower || 0} variant="caption" visibleDecimals={2} />
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
            onClick={() => openGovVote(id, true, power)}
          >
            <Trans>Vote YAE</Trans>
          </Button>
          <Button
            color="error"
            variant="contained"
            fullWidth
            onClick={() => openGovVote(id, false, power)}
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
