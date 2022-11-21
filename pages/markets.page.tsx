import { MainLayout } from 'src/layouts/MainLayout';
import MarketAssetsList from 'src/modules/markets/MarketAssetsList';
import { MarketsTopPanel } from 'src/modules/markets/MarketsTopPanel';

import { ContentContainer } from '../src/components/ContentContainer';

export default function Markets() {
  return (
    <>
      <MarketsTopPanel />
      <ContentContainer>
        <MarketAssetsList />
      </ContentContainer>
    </>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
