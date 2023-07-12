import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';
import { ManageModal } from 'src/maneki/transactions/Manage/ManageModal';

import { ManageDataProvider } from '../src/maneki/hooks/manage-data-provider/ManageDataProvider';
// import { ManagePawContainer } from '../src/maneki/modules/manage/ManageContainer';
import {
  ManageTemporaryTopPanel,
  // ManageTopPanel,
} from '../src/maneki/modules/manage/ManageTopPanel';

export default function ManagePaw() {
  return (
    <>
      <ManageDataProvider>
        <>
          {/* <ManageTopPanel /> */}
          <ManageTemporaryTopPanel />
          <ContentContainer>
            <ManekiLoadingPaper description="Coming Soon..." />
            {/* <ManagePawContainer /> */}
          </ContentContainer>
          <ManageModal />
        </>
      </ManageDataProvider>
    </>
  );
}

ManagePaw.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
