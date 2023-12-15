import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { useRootStore } from 'src/store/root';

export default function AaveUserMaintenancePage() {
  const theme = useTheme();
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Maintenance',
    });
  }, [trackEvent]);
  return (
    <>
      <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <TopInfoPanel />
        <ContentContainer>
          <Paper
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              p: 4,
              flex: 1,
              backgroundColor: theme.palette.mode === 'dark' ? 'transparent' : '',
            }}
          >
            <Box sx={{ maxWidth: 444, m: '0 auto' }}>
              <img width="100%" height="auto" src="/404/404.svg" alt="503 - Service Unavailable" />
            </Box>
            <Typography variant="display1" sx={{ mt: 2 }}>
              <Trans>Under Maintenance</Trans>
            </Typography>
            <Typography sx={{ mt: 3, mb: 5, maxWidth: 480 }}>
              <Trans>
                Sorry, we are currently undergoing maintenance. Please check back shortly or follow
                updates on <Link href="https://twitter.com/aave">X</Link>.
              </Trans>
              <br />
            </Typography>
          </Paper>
        </ContentContainer>
      </Box>
    </>
  );
}
