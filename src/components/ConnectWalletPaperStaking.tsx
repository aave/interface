import { Trans } from '@lingui/macro';
import { CircularProgress, Grid, Paper, PaperProps, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { StakingPanelNoWallet } from 'src/modules/staking/StakingPanelNoWallet';

import { ConnectWalletButton } from './WalletConnection/ConnectWalletButton';

interface ConnectWalletPaperStakingProps extends PaperProps {
  loading?: boolean;
  description?: ReactNode;
}

export const ConnectWalletPaperStaking = ({
  loading,
  description,
  sx,
  ...rest
}: ConnectWalletPaperStakingProps) => {
  return (
    <Paper
      {...rest}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
        flex: 1,
        ...sx,
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
            <Typography sx={{ mb: 6 }} color="text.secondary">
              {description || (
                <Trans>
                  Please connect your wallet to see your supplies, borrowings, and open positions.
                </Trans>
              )}
            </Typography>
            <ConnectWalletButton funnel={'Staking page'} />
            <Grid container spacing={1} pt={6} sx={{ maxWidth: '758px', textAlign: 'right' }}>
              <Grid item xs={12} md={4}>
                <StakingPanelNoWallet stakedToken={'GHO'} icon={'gho'} />
              </Grid>
              <Grid item xs={12} md={4}>
                <StakingPanelNoWallet stakedToken={'AAVE'} icon={'aave'} />
              </Grid>
              <Grid item xs={12} md={4}>
                <StakingPanelNoWallet stakedToken={'ABPT V2'} icon={'stkbptv2'} />
              </Grid>
            </Grid>
          </>
        )}
      </>
    </Paper>
  );
};
