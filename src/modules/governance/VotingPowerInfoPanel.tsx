import { Trans } from '@lingui/macro';
import { Box, Button, Divider, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { useVotingPower } from 'src/hooks/governance-data-provider/useVotingPower';

export function VotingPowerInfoPanel() {
  const { votingPower, propositionPower } = useVotingPower();

  // TODO: if not logged in & loading, show some placeholder
  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        <Typography variant="h3" gutterBottom>
          <Trans>Your info</Trans>
        </Typography>
        <Row
          sx={{ py: 2 }}
          caption={
            <>
              <Typography variant="description">
                <Trans>Voting power</Trans>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <Trans>(AAVE + stkAAVE)</Trans>
              </Typography>
            </>
          }
        >
          <FormattedNumber value={votingPower} variant="main16" visibleDecimals={2} />
        </Row>
        <Row
          sx={{ py: 2 }}
          caption={
            <>
              <Typography variant="description">
                <Trans>Proposition power</Trans>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <Trans>(AAVE + stkAAVE)</Trans>
              </Typography>
            </>
          }
        >
          <FormattedNumber value={propositionPower} variant="main16" visibleDecimals={2} />
        </Row>
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
