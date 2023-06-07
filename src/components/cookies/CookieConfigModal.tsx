import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  FormControlLabel,
  SvgIcon,
  Switch,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { useRootStore } from 'src/store/root';

import DisabledDark from '/public/icons/cookies/icon_dark.svg';
import DisabledLight from '/public/icons/cookies/icon_light.svg';

const CookieConfigModal = () => {
  const [
    isTrackingEnabled,
    optInAnalytics,
    optOutAnalytics,
    cookieConfigOpen,
    setCookieConfigOpen,
  ] = useRootStore((store) => [
    store.isTrackingEnabled,
    store.acceptCookies,
    store.rejectCookies,
    store.cookieConfigOpen,
    store.setCookieConfigOpen,
  ]);

  const [analyticsEnabled, setAnalyticsEnabled] = useState(isTrackingEnabled);
  useEffect(() => {
    setAnalyticsEnabled(isTrackingEnabled);
  }, [isTrackingEnabled, cookieConfigOpen]);
  // const [functionalEnabled, setFunctionalEnabled] = useState(false);

  const setOpen = () => {
    setCookieConfigOpen(!cookieConfigOpen);
  };

  const handleAnalyticsChoice = () => {
    setAnalyticsEnabled(!analyticsEnabled);
  };

  // const handleFunctionalChoice = () => {
  //   setFunctionalEnabled(!functionalEnabled);
  // };

  const handleSave = () => {
    setCookieConfigOpen(false);

    if (analyticsEnabled) {
      optInAnalytics();
    }
    if (!analyticsEnabled) {
      optOutAnalytics();
    }
  };

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <BasicModal open={cookieConfigOpen} withCloseButton={true} setOpen={setOpen}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', width: '100%' }} mb={5}>
          <Typography variant="h2">
            <Trans>Manage cookies</Trans>
          </Typography>
        </Box>
        <Typography variant="description" sx={{ textAlign: 'left', mb: 4 }}>
          <Trans>
            Cookies are small data files stored by your browser when you visit a site. We use them
            too, and while the cookies required for this website to work correctly are always on,
            you can manage the rest.
          </Trans>{' '}
        </Typography>
        <Warning severity="info">
          <Trans>
            Please note that rejecting certain cookies may affect your experience of our site and
            the available features. See our{' '}
            <Link href="https://aave.com/privacy-policy/"> Cookie Policy</Link>.
          </Trans>
        </Warning>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              width: '65px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'flex-end',
            }}
          >
            <FormControlLabel
              label=""
              sx={{ pt: '3px', pr: 1, mr: 0, cursor: 'default' }}
              control={
                <SvgIcon sx={{ width: '2em' }}>
                  {theme.palette.mode === 'dark' ? (
                    <DisabledDark sx={{ mr: 0 }} />
                  ) : (
                    <DisabledLight sx={{ mr: 0 }} />
                  )}
                </SvgIcon>
              }
            />
          </Box>
          <Box>
            <Typography variant="h4">
              <Trans>Strictly necessary cookies</Trans>
            </Typography>
            <Typography variant="description" sx={{ mb: 5 }}>
              <Trans>Required for the correct operation of the website. Cannot be disabled.</Trans>
            </Typography>
          </Box>
        </Box>

        <Box display="flex">
          <Box>
            <FormControlLabel
              label=""
              sx={{ mx: 0, mt: '-2px' }}
              control={
                <Switch
                  disableRipple
                  checked={analyticsEnabled}
                  onClick={handleAnalyticsChoice}
                  data-cy={'wrappedSwitcher'}
                />
              }
            />
          </Box>
          <Box mb={5}>
            <Typography variant="h4">
              <Trans>Analytics and performance cookies</Trans>
            </Typography>
            <Typography variant="description" sx={{ mb: 5 }}>
              <Trans>
                These cookies collect information about how you use the website, such as the pages
                you visit and the links you click on. They help improve website usability.
              </Trans>
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{ maxWidth: '352px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Button
            sx={{
              width: isMobile ? '307px' : '352px',
              height: '44px',
            }}
            onClick={handleSave}
            variant="contained"
          >
            <Trans>Save my preferences</Trans>
          </Button>
          <Box
            sx={{
              fontFamily: 'inter',
              fontWeight: 400,
              letterSpacing: 0.4,
              color: '#A5A8B6',
              fontSize: '10px',
              textAlign: 'center',
            }}
            pl={3}
            pr={3}
            pt={4}
          >
            <Trans>
              You can change your preferences anytime via the link at the bottom of the page.
            </Trans>
          </Box>
        </Box>
      </Box>
    </BasicModal>
  );
};

export default CookieConfigModal;
