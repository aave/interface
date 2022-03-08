import { MainLayout } from 'src/layouts/MainLayout';
import AssetsList from 'src/modules/markets/AssetsList';
import { MarketsTopPanel } from 'src/modules/markets/MarketsTopPanel';

import { ContentContainer } from '../src/components/ContentContainer';

export default function Markets() {
  return (
    <>
      <MarketsTopPanel />
      <ContentContainer>
        <AssetsList />
      </ContentContainer>
    </>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
