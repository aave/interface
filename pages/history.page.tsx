import * as React from 'react';
import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { HistoryTopPanel } from 'src/modules/history/HistoryTopPanel';
import { HistoryWrapper } from 'src/modules/history/HistoryWrapper';
import { useRootStore } from 'src/store/root';

export default function History() {
  const { trackEvent } = useRootStore();

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'History',
    });
  }, []);
  return (
    <>
      <HistoryTopPanel />
      <ContentContainer>
        <HistoryWrapper />
      </ContentContainer>
    </>
  );
}

History.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
