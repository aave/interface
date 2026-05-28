import { Trans } from '@lingui/macro';
import { Paper, Typography } from '@mui/material';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';

/**
 * Sidebar shown on the sGHO page when no wallet is connected — prompts the
 * user to connect so the savings cards can render their personalised state.
 */
export const YourInfoSidebar = () => {
  return (
    <Paper
      sx={{
        pt: 4,
        pb: { xs: 4, xsm: 6 },
        px: { xs: 4, xsm: 6 },
        minWidth: { xs: '100%', mdlg: '416px' },
        width: { xs: '100%', mdlg: '416px' },
        flexShrink: 0,
      }}
    >
      <Typography variant="h3" sx={{ mb: 4 }}>
        <Trans>Your info</Trans>
      </Typography>
      <Typography sx={{ mb: 6 }} color="text.secondary">
        <Trans>Please connect a wallet to view your personal information here.</Trans>
      </Typography>
      <ConnectWalletButton />
    </Paper>
  );
};
