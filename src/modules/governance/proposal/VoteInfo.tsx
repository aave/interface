import { ProposalState } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { CustomProposalType } from 'src/static-build/proposal';

export function VoteInfo({ id, state, strategy, startBlock }: CustomProposalType) {
  const { openGovVote } = useModalContext();

  const [votedPower, setVotedPower] = useState<string>();
  const [support, setSupport] = useState<boolean>();
  const [didVote, setDidVote] = useState<boolean>();
  const [power, setPower] = useState<string>('0');

  const { governanceService } = useGovernanceDataProvider();
  const { currentAccount } = useWeb3Context();
  const voteOngoing = state === ProposalState.Active;

  const fetchCurrentVote = async () => {
    try {
      const { support, votingPower } = await governanceService.getVoteOnProposal({
        user: currentAccount,
        proposalId: id,
      });

      if (votingPower && votingPower.toString() !== '0') {
        setSupport(support);
        setVotedPower(votingPower.toString());
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
    }
    fetchCurrentVote();
    if (voteOngoing) fetchVotingPower();
  }, [voteOngoing, currentAccount]);

  return (
    <>
      <Typography variant="h3">
        <Trans>Your voting info</Trans>
      </Typography>
      <Typography>
        Did vote: {didVote ? 'yes' : 'no'}
        <br />
        InSupport: {support ? 'yes' : 'no'}
        <br />
        Voted with a power of: {votedPower}
        <br />
        Power at the time of creation: {power}
        <br />
        {voteOngoing && (
          <>
            <Button
              color="success"
              variant="contained"
              onClick={() => openGovVote(id, true, power)}
              disabled={support === true}
            >
              Vote YAE
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={() => openGovVote(id, false, power)}
              disabled={support === false}
            >
              Vote NAY
            </Button>
          </>
        )}
      </Typography>
    </>
  );
}
