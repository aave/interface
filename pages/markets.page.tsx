import { Box, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useRef } from 'react';
import { ROUTES } from 'src/components/primitives/Link';
import { MainLayout } from 'src/layouts/MainLayout';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { MarketAssetsListContainer } from 'src/modules/markets/MarketAssetsListContainer';
import { MarketsTopPanel } from 'src/modules/markets/MarketsTopPanel';
import { useRootStore } from 'src/store/root';

interface MarketContainerProps {
  children: ReactNode;
}

export const marketContainerProps = {
  sx: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    pb: '39px',
    px: {
      xs: 2,
      xsm: 5,
      sm: 12,
      md: 5,
      lg: 0,
      xl: '96px',
      xxl: 0,
    },
    maxWidth: {
      xs: 'unset',
      lg: '1240px',
      xl: 'unset',
      xxl: '1440px',
    },
  },
};

export const MarketContainer = ({ children }: MarketContainerProps) => {
  return <Container {...marketContainerProps}>{children}</Container>;
};

export default function Markets() {
  const router = useRouter();
  const { currentAccount } = useWeb3Context();
  const trackEvent = useRootStore((store) => store.trackEvent);
  const prevAccountRef = useRef<string | undefined>();
  const isInitialMount = useRef(true);

  // Redirect to dashboard only when wallet gets connected (not when already connected)
  useEffect(() => {
    // Skip the initial mount to avoid redirecting when already connected
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevAccountRef.current = currentAccount;
      return;
    }

    const wasConnected = !!prevAccountRef.current;
    const isConnected = !!currentAccount;

    // Only redirect if wallet was not connected before but is now connected
    if (!wasConnected && isConnected) {
      router.replace(ROUTES.dashboard);
    }

    // Update the ref for next comparison
    prevAccountRef.current = currentAccount;
  }, [currentAccount, router]);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Markets',
    });
  }, [trackEvent]);

  return (
    <>
      <MarketsTopPanel />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          mt: { xs: '-32px', lg: '-46px', xl: '-44px', xxl: '-48px' },
        }}
      >
        <MarketContainer>
          <MarketAssetsListContainer />
        </MarketContainer>
      </Box>
    </>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
