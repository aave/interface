import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Paper, PaperProps, Typography } from '@mui/material';
import { useModal } from 'connectkit';
import { ReactNode } from 'react';

import LandingGhost from '/public/resting-gho-hat-purple.svg';

import { ConnectWalletButton } from './WalletConnection/ConnectWalletButton';

interface ConnectWalletPaperProps extends PaperProps {
  description?: ReactNode;
}

export const ConnectWalletPaper = ({ description, sx, ...rest }: ConnectWalletPaperProps) => {
  const { open } = useModal();

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
      <Box>
        <LandingGhost />
      </Box>
      <>
        {open ? (
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
          </>
        )}
      </>
    </Paper>
  );
};
