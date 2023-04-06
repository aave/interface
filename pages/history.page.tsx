import * as React from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { HistoryTopPanel } from 'src/modules/history/HistoryTopPanel';
import HistoryWrapper from 'src/modules/history/HistoryWrapper';

export default function History() {
  return (
    <>
      <HistoryTopPanel />
      <ContentContainer>
        <HistoryWrapper />
      </ContentContainer>
    </>
  );
}

History.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
