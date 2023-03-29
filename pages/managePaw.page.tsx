import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';

import { ManagePawContainer } from '../src/maneki/modules/manage/ManageContainer';
import { ManageTopPanel } from '../src/maneki/modules/manage/ManageTopPanel';

export default function Airdrops() {
  return (
    <>
      <ManageTopPanel />
      <ContentContainer>
        <ManagePawContainer />
      </ContentContainer>
    </>
  );
}

Airdrops.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
