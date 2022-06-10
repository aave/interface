import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import React, { ReactNode } from 'react';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';

import { AppHeader } from './AppHeader';

export function MainLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const disableTestnet = () => {
    const testnetsEnabledId = 'testnetsEnabled';
    localStorage.setItem(testnetsEnabledId, 'false');
    router.reload();
  };

  const banner = (
    <Box
      sx={{
        height: 36,
        bgcolor: '#1B2030',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="caption" color="#FFFFFF">
        <Trans>The app is running in testnet mode</Trans>
        <Button
          variant="outlined"
          size="small"
          sx={{ mx: 2, backgroundColor: '#EBEBED' }}
          onClick={disableTestnet}
        >
          DISABLE TESTNET
        </Button>
      </Typography>
    </Box>
  );

  return (
    <>
      {ENABLE_TESTNET && banner}
      <AppHeader />
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </Box>
    </>
  );
}
