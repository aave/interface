import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CookieConsent as AnalyticsConsentBanner } from 'react-cookie-consent';
import { Link } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';

export default function AnalyticsBanner() {
  const [optInAnalytics, optOutAnalytics, analyticsConfigOpen] = useRootStore((store) => [
    store.acceptAnalytics,
    store.rejectAnalytics,
    store.analyticsConfigOpen,
  ]);

  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    // Adds a delay before showing the banner.
    const timerId = setTimeout(() => {
      setBannerVisible(true);
    }, 1000); // Start sliding in after 1 second.

    return () => clearTimeout(timerId);
  }, []);

  const theme = useTheme();

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const hasUserMadeChoice =
    typeof window !== 'undefined' && localStorage.getItem('userAcceptedAnalytics') !== null;

  // Note: If they have already chosen don't show again unless configured from footer
  if (hasUserMadeChoice) return null;

  return (
    <>
      <AnalyticsConsentBanner
        buttonText={<Typography>Allow analytics </Typography>}
        declineButtonText={<Typography>Opt-out</Typography>}
        disableStyles={true}
        visible={analyticsConfigOpen ? 'show' : 'hidden'}
        flipButtons
        style={{
          background: theme.palette.background.primary,
          bottom: isMobile ? '24px' : '24px',
          right: isMobile ? '50%' : '24px',
          left: isMobile ? '50%' : 'auto',
          position: 'fixed',
          width: '380px',
          gap: '16px',
          display: 'flex',
          flexDirection: 'column',
          flexFlow: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: theme.palette.text.secondary,
          marginBottom: 20,
          fontSize: '15px',
          lineHeight: '21px',
          padding: 20,
          zIndex: 100,
          borderRadius: '16px',
          boxShadow: '0px 8px 16px -2px rgba(27, 33, 44, 0.12)',
          transition: 'transform 0.5s ease-out', // Add this

          transform: bannerVisible
            ? isMobile
              ? 'translateX(-50%)'
              : 'none'
            : 'translateX(100%) translateY(100%)',
        }}
        buttonStyle={{
          background: theme.palette.primary.main,
          color: theme.palette.text.buttonText,
          fontSize: '14px',
          borderRadius: '8px',
          margin: '0px',
          width: '162px',
          height: '45px',
          cursor: 'pointer',
        }}
        declineButtonStyle={{
          background: theme.palette.background.primary,
          color: theme.palette.text.primary,
          lineHeight: '24px',
          fontSize: '14px',
          borderRadius: '8px',
          margin: '8px',
          border: `1px solid ${theme.palette.text.subText}`,
          width: '162px',
          height: '45px',
          cursor: 'pointer',
        }}
        enableDeclineButton
        onDecline={() => {
          optOutAnalytics();
        }}
        onAccept={() => {
          optInAnalytics();
        }}
        cookieName="userAcceptedAnalytics"
      >
        <Box>
          We may use real-time tracking technologies to collect data about your interactions,
          preferences and behavior during your browsing session. This data helps us personalize your
          experience and improve our services. For more information, please refer to our.&nbsp;
          <Link href="https://aave.com/privacy-policy/">[Privacy Policy]</Link>
        </Box>
      </AnalyticsConsentBanner>
    </>
  );
}
