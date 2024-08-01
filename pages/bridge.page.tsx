import * as React from 'react';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { BridgeTopPanel } from 'src/modules/bridge/BridgeTopPanel';
import { BridgeWrapper } from 'src/modules/bridge/BridgeWrapper';
import { useRootStore } from 'src/store/root';

export default function Bridge() {
  const trackEvent = useRootStore((store) => store.trackEvent);

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Bridge Transactions',
    });
  }, [trackEvent]);
  return (
    <>
      <BridgeTopPanel />
      <ContentContainer>
        <BridgeWrapper />
      </ContentContainer>
    </>
  );
}

Bridge.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
