import { ProposalState } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { CustomProposalType } from 'src/static-build/proposal';

export function VoteInfo({ id, state }: CustomProposalType) {
  const [votingPower, setVotingPower] = useState<string>();
  const [support, setSupport] = useState<boolean>();
  const [didVote, setDidVote] = useState<boolean>();

  const { governanceService } = useGovernanceDataProvider();
  const { currentAccount } = useWeb3Context();

  const fetchCurrentVote = async () => {
    try {
      const { support, votingPower } = await governanceService.getVoteOnProposal({
        user: currentAccount,
        proposalId: id,
      });
      if (votingPower && votingPower.toString() !== '0') {
        setSupport(support);
        setVotingPower(votingPower.toString());
        setDidVote(true);
      } else {
        setDidVote(false);
      }
    } catch (e) {
      console.log('error fetching vote info', e);
    }
  };

  useEffect(() => {
    fetchCurrentVote();
  }, []);

  const canVote = state === ProposalState.Active || true; // TODO: remove true condition
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
        With a power of: {votingPower}
        <br />
        {canVote && (
          <Button variant="contained" onClick={() => console.log('TODO: cast vote')}>
            Vote
          </Button>
        )}
      </Typography>
    </>
  );
}
