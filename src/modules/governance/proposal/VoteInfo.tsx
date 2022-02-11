import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

interface VoteInfoProps {
  id: number;
}

export function VoteInfo({ id }: VoteInfoProps) {
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
  return (
    <>
      <Typography variant="h3">
        <Trans>Your voting info</Trans>
      </Typography>
      <Typography>
        Did vote: {didVote ? 'yes' : 'no'}
        {votingPower}
        {support}
      </Typography>
    </>
  );
}
