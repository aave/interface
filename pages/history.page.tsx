import * as React from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { useTransactionHistory } from 'src/hooks/useTransactionHistory';
import { MainLayout } from 'src/layouts/MainLayout';
import { HistoryTopPanel } from 'src/modules/history/HistoryTopPanel';
import TransactionsList from 'src/modules/history/TransactionsList';

export default function History() {
  const { data: transactions, isLoading } = useTransactionHistory();

  return (
    <>
      <HistoryTopPanel />
      <ContentContainer>
        <TransactionsList transactions={transactions} loading={isLoading} />
      </ContentContainer>
    </>
  );
}

History.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
