import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';

// import { AirdropContainer } from '../src/maneki/modules/airdrop/AirdropContainer';
import { AirdropTopPanel } from '../src/maneki/modules/airdrop/AirdropTopPanel';

export default function Airdrops() {
  return (
    <>
      <AirdropTopPanel />
      <ContentContainer>
        <ManekiLoadingPaper description="Coming Soon..." />
        {/* <AirdropContainer /> */}
      </ContentContainer>
    </>
  );
}

Airdrops.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
