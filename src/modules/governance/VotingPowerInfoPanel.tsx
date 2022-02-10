import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

export function VotingPowerInfoPanel() {
  return (
    <div>
      <Typography variant="h3" gutterBottom>
        <Trans>Your info</Trans>
      </Typography>
      <Typography>
        <Trans>Voting power</Trans>
      </Typography>
      <Typography>
        <Trans>Proposition power</Trans>
      </Typography>
    </div>
  );
}
