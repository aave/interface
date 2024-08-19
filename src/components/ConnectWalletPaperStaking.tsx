import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Grid, Paper, PaperProps, Typography } from '@mui/material';
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
        px: 5,
        py: 25,
        flex: 1,
        ...sx,
      }}
    >
      <>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h2" sx={{ mb: 8 }} color={'text.primary'}>
              <Trans>Please, connect your wallet</Trans>
            </Typography>
            <Typography sx={{ mb: 10, fontSize: '20px' }} color="text.secondary">
              {description || (
                <Trans>
                  Please connect your wallet to see your supplies, borrowings, and open positions.
                </Trans>
              )}
            </Typography>
            <ConnectWalletButton funnel={'Staking page'} />
            <Box
              pt={17}
              sx={{
                width: '100%',
                textAlign: 'right',
                justifyContent: 'space-between',
                flexDirection: 'row',
                display: 'flex',
                gap: 3,
              }}
            >
              <StakingPanelNoWallet stakedToken={'GHO'} icon={'gho'} />
              {/* <StakingPanelNoWallet stakedToken={'AAVE'} icon={'aave'} /> */}
              <StakingPanelNoWallet stakedToken={'ABPT V2'} icon={'stkbptv2'} />
            </Box>
          </>
        )}
      </>
    </Paper>
  );
};
