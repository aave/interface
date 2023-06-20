import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { MarketAssetsListContainer } from 'src/modules/markets/MarketAssetsListContainer';
import { MarketsTopPanel } from 'src/modules/markets/MarketsTopPanel';
import { useRootStore } from 'src/store/root';

export default function Markets() {
  const { trackEvent } = useRootStore();

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Markets',
    });
  }, []);
  return (
    <>
      <MarketsTopPanel />
      <ContentContainer>
        <MarketAssetsListContainer />
      </ContentContainer>
    </>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
