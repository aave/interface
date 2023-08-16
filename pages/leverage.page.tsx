import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';

import ManekiLoadingPaper from '../src/maneki/components/ManekiLoadingPaper';
import { LeverageTopPanel } from '../src/maneki/modules/leverage/LeverageTopPanel';

export default function Airdrops() {
  return (
    <>
      <LeverageTopPanel />
      <ContentContainer>
        <ManekiLoadingPaper description="Coming soon..." />
      </ContentContainer>
    </>
  );
}

Airdrops.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
