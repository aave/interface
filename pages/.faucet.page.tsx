import * as React from 'react';
import { FaucetModal } from 'src/components/transactions/Faucet/FaucetModal';
import { MainLayout } from 'src/layouts/MainLayout';
import FaucetAssetsList from 'src/modules/faucet/FaucetAssetsList';
import { FaucetTopPanel } from 'src/modules/faucet/FaucetTopPanel';

import { ContentContainer } from '../src/components/ContentContainer';

export default function Faucet() {
  return (
    <>
      <FaucetTopPanel />
      <ContentContainer>
        <FaucetAssetsList />
      </ContentContainer>
    </>
  );
}

Faucet.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      <FaucetModal />
    </MainLayout>
  );
};
