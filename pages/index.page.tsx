import Script from 'next/script';
import { useEffect } from 'react';
import { useRootStore } from 'src/store/root';

import { ContentContainer } from '../src/components/ContentContainer';
import { MainLayout } from '../src/layouts/MainLayout';
import { HomeContentWrapper } from '../src/modules/home/HomeContentWrapper';
import { HomeTopPanel } from '../src/modules/home/HomeTopPanel';

export default function Home() {
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Dashboard',
    });
  }, [trackEvent]);

  return (
    <>
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-8XV0L3H2X6" />
      <Script id="google-analytics">
        {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-8XV0L3H2X6');`}
      </Script>

      <HomeTopPanel />

      <ContentContainer>
        <HomeContentWrapper />
      </ContentContainer>
    </>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
