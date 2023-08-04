import { MainLayout } from 'src/layouts/MainLayout';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';
import TGEModal from 'src/maneki/transactions/TGE/TGEModal';

import { ContentContainer } from '../src/components/ContentContainer';
import { TGEDataProvider } from '../src/maneki/hooks/tge-data-provider/TGEDataProvider';
// import { TGEContainer } from '../src/maneki/modules/tge/TGEContainer';
import { TGETopPanel } from '../src/maneki/modules/tge/TGETopPanel';

export default function TGE() {
  return (
    <>
      <TGEDataProvider>
        <>
          <TGETopPanel />
          <ContentContainer>
            <ManekiLoadingPaper description="Coming Soon..." />
            {/* <TGEContainer /> */}
          </ContentContainer>
          <TGEModal />
        </>
      </TGEDataProvider>
    </>
  );
}

TGE.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
