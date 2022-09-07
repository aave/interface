import Link from 'next/link';
import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography, useTheme } from '@mui/material';
import { MainLayout } from 'src/layouts/MainLayout';
import { ContentContainer } from 'src/components/ContentContainer';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';

export default function Aave404Page() {
  const theme = useTheme();

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
          <Box sx={{ maxWidth: 444, m: '0 auto' }}>
            <img
              width="100%"
              height="auto"
              src={theme.palette.mode === 'dark' ? `/404/404DarkMode.svg` : `/404/404LightMode.svg`}
              alt="404 - Page not found"
            />
          </Box>
          <Typography variant="display1" sx={{ mt: 8, mb: 3 }}>
            <Trans>Page Not Found</Trans>
          </Typography>
          <Typography sx={{ mt: 2, mb: 5 }}>
            <Trans>Sorry, we couldn&apos;t find the page you were looking for.</Trans>
            <br />
            <Trans>We suggest you go back to the Dashboard.</Trans>
          </Typography>
          <Link href="/" passHref>
            <Button variant="outlined" color="primary">
              <Trans>Back to Dashboard</Trans>
            </Button>
          </Link>
        </Paper>
      </ContentContainer>
    </>
  );
}

Aave404Page.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
