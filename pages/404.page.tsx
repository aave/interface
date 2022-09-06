import { Trans } from '@lingui/macro';
import { MainLayout } from 'src/layouts/MainLayout';
import { ContentContainer } from 'src/components/ContentContainer';
import { Button, Paper, Typography, useTheme } from '@mui/material';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import Link from 'next/link';

import StatusCode from '/public/404/StatusCode404.svg';
import Image from 'next/image';

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
          {/* <Box sx={{ maxWidth: '100px', mb: 8 }}>
            <Image width={300} height={100} src="/404/StatusCode404.svg" layout="intrinsic" />
          </Box> */}
          <StatusCode />
          <Typography variant="display1" sx={{ mt: 8, mb: 3 }}>
            <Trans>Page not found</Trans>
          </Typography>
          <Typography sx={{ mt: 2, mb: 5 }}>
            <Trans>Sorry, we couldn&apos;t find the page you were looking for.</Trans>
            <br />
            <Trans>We suggest you back to the Dashboard.</Trans>
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
