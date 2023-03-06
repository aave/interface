import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';

import { AirdropContainer } from '../src/modules/airdrop/AirdropContainer';
import { AirdropTopPanel } from '../src/modules/airdrop/AirdropTopPanel';

export default function Airdrops() {
  return (
    <>
      <AirdropTopPanel />
      <ContentContainer>
        <AirdropContainer />
      </ContentContainer>
    </>
  );
}

Airdrops.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
