import { Trans } from '@lingui/macro';
import { Button, Paper, Typography } from '@mui/material';

import { useWeb3Context } from '../libs/hooks/useWeb3Context';

export const ConnectWalletPaper = () => {
  const { connectWallet } = useWeb3Context();

  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        flex: 1,
      }}
    >
      <Typography variant="h2" sx={{ mb: 2 }}>
        <Trans>Please, connect your wallet</Trans>
      </Typography>
      <Typography sx={{ mb: 6 }}>
        <Trans>To see your supplies and borrowings, connect your wallet.</Trans>
      </Typography>
      <Button variant="gradient" onClick={connectWallet}>
        <Trans>Connect wallet</Trans>
      </Button>
    </Paper>
  );
};
