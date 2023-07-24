import React from 'react';
import { MainLayout } from 'src/layouts/MainLayout';
import { LeverageDataProvider } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';

export default function Leverage() {
  return (
    <>
      <LeverageDataProvider>
        <></>
      </LeverageDataProvider>
    </>
  );
}

Leverage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
