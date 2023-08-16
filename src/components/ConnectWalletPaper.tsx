import { Trans } from '@lingui/macro';
import { CircularProgress, Paper, PaperProps, Typography, useTheme } from '@mui/material';
import Image from 'next/image';
import { ReactNode } from 'react';

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
        boxShadow: `0px 10px 30px 10px ${theme.palette.shadow.dashboard}`,
        ...sx,
      }}
    >
      <Image
        src="/maneki-3d.png"
        width="200px"
        height="200px"
        alt="maneki cat 3d logo"
        style={{
          marginBottom: '16px',
        }}
      />
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
