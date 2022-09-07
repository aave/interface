import Link from 'next/link';
import { Trans } from '@lingui/macro';
import { MainLayout } from 'src/layouts/MainLayout';
import { ContentContainer } from 'src/components/ContentContainer';
import { Button, Paper, SvgIcon, Typography, useTheme } from '@mui/material';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { DuplicateIcon, RefreshIcon } from '@heroicons/react/outline';

export default function Aave500Page() {
  const theme = useTheme();

  const handleCopyError = () => {
    console.log('copying error to clipboard');
  };

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
            <Trans>Something Went Wrong</Trans>
          </Typography>
          <Typography sx={{ mt: 2, mb: 5, maxWidth: 480 }}>
            <Trans>
              Sorry, an unexpected error has occurred. We know about the problem and are working to
              fix it. In the meantime, you may retry again, or go back to the dashboard.
            </Trans>
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            endIcon={
              <SvgIcon>
                <RefreshIcon />
              </SvgIcon>
            }
            onClick={() => window.location.reload()}
            sx={{ mb: 4 }}
          >
            <Trans>Reload</Trans>
          </Button>
          <Link href="/" passHref>
            <Button variant="outlined" color="primary" sx={{ mb: 4 }}>
              <Trans>Back to Dashboard</Trans>
            </Button>
          </Link>
          <Button
            color="primary"
            startIcon={
              <SvgIcon>
                <DuplicateIcon />
              </SvgIcon>
            }
            onClick={handleCopyError}
          >
            <Trans>Copy Error</Trans>
          </Button>
        </Paper>
      </ContentContainer>
    </>
  );
}

Aave500Page.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
