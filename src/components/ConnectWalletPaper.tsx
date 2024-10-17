import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Paper, PaperProps, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

import ZeebuToken from '/public/ZeebuToken.svg';

import { ConnectWalletButton } from './WalletConnection/ConnectWalletButton';

interface ConnectWalletPaperProps extends PaperProps {
  loading?: boolean;
  description?: ReactNode;
}

export const ConnectWalletPaper = ({
  loading,
  description,
  sx,
  ...rest
}: ConnectWalletPaperProps) => {
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
        border: 0,
        borderBottom: '1px solid hsla(0,0%,100%,.2)',
        background:
          'radial-gradient(61.2% 18.19% at 52.96% 0, hsla(0, 0%, 100%, .3) 0, hsla(0, 0%, 60%, 0) 100%), linear-gradient(127deg, hsla(0, 0%, 100%, .15) 2.54%, hsla(0, 0%, 60%, .15) 97.47%);',
        boxShadow: ' 0px 3px 4px 0px rgba(41, 127, 234, 0.15) inset',
        backdropFilter: 'blur(4px)',
        borderRadius: '30px 0 30px 0',
        ...sx,
      }}
    >
      <Box>
        <ZeebuToken />
      </Box>
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
          </>
        )}
      </>
    </Paper>
  );
};
