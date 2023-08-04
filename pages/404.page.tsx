import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import { ContentContainer } from 'src/components/ContentContainer';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { MainLayout } from 'src/layouts/MainLayout';

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
            <img width="100%" height="auto" src="/404/404.svg" alt="404 - Page not found" />
          </Box>
          <Typography variant="display1" sx={{ mt: 2 }}>
            <Trans>Page not found</Trans>
          </Typography>
          <Typography sx={{ mt: 3, mb: 5, maxWidth: 480 }}>
            <Trans>Sorry, we couldn&apos;t find the page you were looking for.</Trans>
            <br />
            <Trans>We suggest you go back to the Home Page.</Trans>
          </Typography>
          <Link href="/" passHref>
            <Button variant="outlined" color="primary">
              <Trans>Back to Home Page</Trans>
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
