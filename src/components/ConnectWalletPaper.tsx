import { Trans } from '@lingui/macro';
import { CircularProgress, Paper, PaperProps, Typography, useTheme } from '@mui/material';
import { ReactNode } from 'react';

//@Modified
import LoveManeki from '/public/loveManeki.svg';

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
  const theme = useTheme();
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
      <LoveManeki
        style={{
          marginBottom: '16px',
          width: '100px',
          height: 'auto',
          fill: theme.palette.text.secondary,
        }}
      />
      {/* <Image src="/maneki-logo-3.png" width="282px" height="192px" alt="maneki logo" /> */}
      <>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h2" sx={{ mb: 2, color: 'text.secondary' }}>
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
