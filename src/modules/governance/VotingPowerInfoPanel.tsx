import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useVotingPower } from 'src/hooks/governance-data-provider/useGovernanceData';

export function VotingPowerInfoPanel() {
  const { votingPower } = useVotingPower();

  return (
    <div>
      <Typography variant="h3" gutterBottom>
        <Trans>Your info</Trans>
      </Typography>
      <Typography>
        <Trans>Voting power</Trans>
        {votingPower}
      </Typography>
      <Typography>
        <Trans>Proposition power</Trans>
      </Typography>
    </div>
  );
}
