import { Trans } from '@lingui/macro';
import { Button, CircularProgress, Paper, Typography } from '@mui/material';

import { useWeb3Context } from '../libs/hooks/useWeb3Context';

interface ConnectWalletPaperProps {
  loading?: boolean;
}

export const ConnectWalletPaper = ({ loading }: ConnectWalletPaperProps) => {
  const { connectWallet } = useWeb3Context();

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        flex: 1,
      }}
    >
      <>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h2" sx={{ mb: 2 }}>
              <Trans>Please, connect your wallet</Trans>
            </Typography>
            <Typography sx={{ mb: 6 }}>
              <Trans>
                Please connect your wallet to see your supplies, borrowings, and open positions.
              </Trans>
            </Typography>
            <Button variant="gradient" onClick={connectWallet}>
              <Trans>Connect wallet</Trans>
            </Button>
          </>
        )}
      </>
    </Paper>
  );
};
