import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as Sentry from '@sentry/nextjs';
import React, { useEffect, useState } from 'react';
import { Link } from 'src/components/primitives/Link';
import { CONSENT_KEY } from 'src/store/analyticsSlice';
import { useRootStore } from 'src/store/root';
import { figVars } from 'src/utils/figmaColors';
import { useAccount } from 'wagmi';
import { useShallow } from 'zustand/shallow';

export default function AnalyticsBanner() {
  const [optInAnalytics, optOutAnalytics, analyticsConfigOpen, isTrackingEnabled] = useRootStore(
    useShallow((store) => [
      store.acceptAnalytics,
      store.rejectAnalytics,
      store.analyticsConfigOpen,
      store.isTrackingEnabled,
    ])
  );

  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    // Adds a delay before showing the banner.
    const timerId = setTimeout(() => {
      setBannerVisible(true);
    }, 1000); // Start sliding in after 1 second.

    return () => clearTimeout(timerId);
  }, []);

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  // Bind Sentry user to wallet if analytics consent is accepted
  const { isConnected, address, connector } = useAccount();
  useEffect(() => {
    const hasConsent = isTrackingEnabled;
    if (hasConsent && isConnected && address) {
      Sentry.setUser({
        wallet: address,
        wallet_type: connector?.name,
      } as Record<string, unknown>);
    } else {
      Sentry.setUser(null);
    }
  }, [isTrackingEnabled, isConnected, address, connector]);

  const hasUserMadeChoice =
    typeof window !== 'undefined' && localStorage.getItem(CONSENT_KEY) !== null;

  // Hide once the user has made a choice. Reopening from the footer clears the stored choice and
  // reopens analyticsConfigOpen, which brings the banner back.
  if (hasUserMadeChoice || !analyticsConfigOpen) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 100,
        bottom: '24px',
        ...(isMobile ? { left: '50%' } : { right: '24px' }),
        width: '400px',
        maxWidth: 'calc(100vw - 48px)',
        p: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        borderRadius: '0.625rem',
        backgroundColor: figVars['bg-2'],
        boxShadow: `0 0 0 1px ${figVars['shadow-stroke-2']}, 0 6px 32px 0 ${figVars['shadow-high']}`,
        transition: 'transform 0.5s ease-out',
        transform: bannerVisible
          ? isMobile
            ? 'translateX(-50%)'
            : 'none'
          : 'translateX(100%) translateY(100%)',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Typography variant="h5" sx={{ color: 'fg-1' }}>
          We value your privacy
        </Typography>
        <Typography
          sx={{ color: 'fg-3', fontSize: '0.875rem', fontWeight: 400, lineHeight: '1.1875rem' }}
        >
          We may employ on-the-spot tracking techniques during your browsing session to collect data
          on your interactions, preferences, and behaviour. This data helps us personalise your
          experience and improve our services. See our{' '}
          <Link
            href="https://aave.com/privacy-policy/"
            sx={{ textDecoration: 'underline', color: 'fg-3' }}
          >
            Privacy Policy
          </Link>
          .
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Button variant="outlined" onClick={() => optOutAnalytics()} sx={{ flex: 1 }}>
          Opt-out
        </Button>
        <Button variant="contained" onClick={() => optInAnalytics()} sx={{ flex: 1 }}>
          Allow analytics
        </Button>
      </Box>
    </Box>
  );
}
