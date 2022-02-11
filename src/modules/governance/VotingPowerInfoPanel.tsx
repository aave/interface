import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useVotingPower } from 'src/hooks/governance-data-provider/useGovernanceData';

const VotingPowerLine = ({ name, value }: { name: ReactNode; value: string }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="description">{name}</Typography>
        <Typography variant="caption" color="text.secondary">
          <Trans>(AAVE + stkAAVE)</Trans>
        </Typography>
      </Box>
      <Typography variant="main16">{value}</Typography>
    </Box>
  );
};

export function VotingPowerInfoPanel() {
  const { votingPower, propositionPower } = useVotingPower();

  // TODO: if not logged in & loading, show some placeholder

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        <Typography variant="h3" gutterBottom>
          <Trans>Your info</Trans>
        </Typography>
        <VotingPowerLine name={<Trans>Voting power</Trans>} value={votingPower} />
        <VotingPowerLine name={<Trans>Proposition power</Trans>} value={propositionPower} />
      </Box>
      <Divider />
      <Box sx={{ px: 6, pt: 4, pb: 6, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography>Delegate your power</Typography>
        </Box>
        <Button variant="contained">Delegate</Button>
      </Box>
    </>
  );
}
