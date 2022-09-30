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
            <ConnectWalletButton />
            <Grid container spacing={6}>
              <Grid
                item
                xs={4}
                lg={6}
                sx={{ display: { xs: !true ? 'none' : 'block', lg: 'block' } }}
              >
                <StakingPanelNoWallet stakedToken={'AAVE'} icon={'aave'} />
              </Grid>
              <Grid
                item
                xs={4}
                lg={6}
                sx={{ display: { xs: !true ? 'none' : 'block', lg: 'block' } }}
              >
                <StakingPanelNoWallet stakedToken={'ABPT'} icon={'bpt'} />
              </Grid>
            </Grid>
          </>
        )}
      </>
    </Paper>
  );
};
