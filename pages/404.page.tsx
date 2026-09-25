import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { AaveLogo } from 'src/components/icons/AaveLogo';
import { ChevronRightIcon } from 'src/components/icons/ChevronRightIcon';
import { Link } from 'src/components/primitives/Link';
import { MainLayout } from 'src/layouts/MainLayout';
import { useRootStore } from 'src/store/root';
import { startIconSizeSx } from 'src/utils/buttonStyles';

export default function Aave404Page() {
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': '404 Error',
    });
  }, [trackEvent]);

  return (
    <ContentContainer>
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Box sx={{ color: 'purple-1', lineHeight: 0 }}>
          <AaveLogo width="7.75rem" height="1.28rem" />
        </Box>
        <Box sx={{ mt: '2rem', width: '1.5rem', height: '0.0625rem', bgcolor: 'border-0' }} />
        <Typography variant="h2" sx={{ mt: '2rem', color: 'fg-1' }}>
          <Trans>Page not found</Trans>
        </Typography>
        <Typography variant="base" sx={{ mt: '1rem', color: 'fg-2', lineHeight: '1.125rem' }}>
          <Trans>We could not find the page you were looking for.</Trans>
        </Typography>
        <Button
          component={Link}
          href="/"
          variant="outlined"
          startIcon={<ChevronRightIcon sx={{ transform: 'rotate(180deg)' }} />}
          sx={{ mt: '2.5rem', ...startIconSizeSx('1.125rem') }}
        >
          <Trans>Back to App</Trans>
        </Button>
      </Box>
    </ContentContainer>
  );
}

Aave404Page.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
