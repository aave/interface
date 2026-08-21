import { Trans } from '@lingui/macro';
import { Box, Paper, Typography } from '@mui/material';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useRootStore } from 'src/store/root';

import { DelegatedInfoPanel } from './DelegatedInfoPanel';
import { RepresentativesInfoPanel } from './RepresentativesInfoPanel';
import { VotingPowerInfoPanel } from './VotingPowerInfoPanel';

export const UserGovernanceInfo = () => {
  const account = useRootStore((state) => state.account);

  return account ? (
    // Card spacing lives here rather than as a top margin on each panel, so the panels don't each
    // have to know they aren't first.
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <VotingPowerInfoPanel />
      <DelegatedInfoPanel />
      <RepresentativesInfoPanel />
    </Box>
  ) : (
    <Paper sx={{ p: 6 }}>
      <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
        <Trans>Your info</Trans>
      </Typography>
      <Typography sx={{ mb: 6 }} color="fg-2">
        <Trans>Please connect a wallet to view your personal information here.</Trans>
      </Typography>
      <ConnectWalletButton funnel="Governance Page" />
    </Paper>
  );
};
