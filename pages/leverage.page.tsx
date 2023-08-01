import React from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { LeverageDataProvider } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';
import LeverageContainer from 'src/maneki/modules/leverage/LeverageContainer';
import { LeverageTopPanel } from 'src/maneki/modules/leverage/LeverageTopPanel';

export default function Leverage() {
  return (
    <>
      <LeverageDataProvider>
        <>
          <LeverageTopPanel />
          <ContentContainer>
            <LeverageContainer />
          </ContentContainer>
        </>
      </LeverageDataProvider>
    </>
  );
}

Leverage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
