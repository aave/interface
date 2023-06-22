import { DuplicateIcon, RefreshIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, Link, Paper, SvgIcon, Typography, useTheme } from '@mui/material';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { MainLayout } from 'src/layouts/MainLayout';
import { useRootStore } from 'src/store/root';

export default function Aave500Page() {
  const theme = useTheme();

  const handleCopyError = () => {
    console.log('copying error to clipboard');
  };
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': '500 Error',
    });
  }, [trackEvent]);
  return (
    <>
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
          <Typography variant="display1" sx={{ mt: 8, mb: 3 }}>
            <Trans>Something went wrong</Trans>
          </Typography>
          <Typography sx={{ mt: 2, mb: 5, maxWidth: 480 }}>
            <Trans>
              Sorry, an unexpected error happened. In the meantime you may try reloading the page,
              or come back later.
            </Trans>
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            startIcon={
              <SvgIcon>
                <RefreshIcon />
              </SvgIcon>
            }
            onClick={() => window.location.reload()}
            sx={{ mb: 10 }}
          >
            <Trans>Reload the page</Trans>
          </Button>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            mt={10}
          >
            <Typography sx={{ mb: 4 }}>
              <Trans>
                If the error continues to happen,
                <br /> you may report it to this
              </Trans>{' '}
              <Link href="https://discord.com/invite/7kHKnkDEUf" color="inherit" target="_blank">
                <Trans>Discord channel</Trans>
              </Link>
              .
            </Typography>
            <Button
              color="primary"
              startIcon={
                <SvgIcon>
                  <DuplicateIcon />
                </SvgIcon>
              }
              onClick={handleCopyError}
            >
              <Trans>Copy error message</Trans>
            </Button>
          </Box>
        </Paper>
      </ContentContainer>
    </>
  );
}

Aave500Page.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
