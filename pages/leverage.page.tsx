import React from 'react';
import { MainLayout } from 'src/layouts/MainLayout';
import { LeverageDataProvider } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';
import LeverageContainer from 'src/maneki/modules/leverage/LeverageContainer';

export default function Leverage() {
  return (
    <>
      <LeverageDataProvider>
        <>
          <LeverageContainer />
        </>
      </LeverageDataProvider>
    </>
  );
}

Leverage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
