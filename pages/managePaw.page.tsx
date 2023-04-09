import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';

import { ManageDataProvider } from '../src/maneki/hooks/manage-data-provider/ManageDataProvider';
import { ManagePawContainer } from '../src/maneki/modules/manage/ManageContainer';
import { ManageTopPanel } from '../src/maneki/modules/manage/ManageTopPanel';

export default function Airdrops() {
  return (
    <>
      <ManageDataProvider>
        <>
          <ManageTopPanel />
          <ContentContainer>
            <ManagePawContainer />
          </ContentContainer>
        </>
      </ManageDataProvider>
    </>
  );
}

Airdrops.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
