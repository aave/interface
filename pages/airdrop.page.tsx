import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';

import { AirdropTopPanel } from '../src/maneki/modules/airdrop/AirdropTopPanel';

export default function Airdrops() {
  return (
    <>
      <AirdropTopPanel />
      <ContentContainer>
        <div>test</div>
      </ContentContainer>
    </>
  );
}

Airdrops.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
