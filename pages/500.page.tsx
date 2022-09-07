import Link from 'next/link';
import { Trans } from '@lingui/macro';
import { MainLayout } from 'src/layouts/MainLayout';
import { ContentContainer } from 'src/components/ContentContainer';
import { Button, Paper, SvgIcon, Typography, useTheme } from '@mui/material';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { RefreshIcon } from '@heroicons/react/outline';

export default function Aave500Page() {
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
          <Typography variant="display1" sx={{ mt: 8, mb: 3 }}>
            <Trans>Something Went Wrong...</Trans>
          </Typography>
          <Typography sx={{ mt: 2, mb: 5 }}>
            <Trans>Sorry, an internal server error has occurred.</Trans>
            <br />
            <Trans>Please try reloading the page.</Trans>
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
          >
            <Trans>Reload</Trans>
          </Button>
        </Paper>
      </ContentContainer>
    </>
  );
}

Aave500Page.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
