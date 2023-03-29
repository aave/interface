import * as React from 'react';
import { MainLayout } from 'src/layouts/MainLayout';
import { HistoryTopPanel } from 'src/modules/history/HistoryTopPanel';

import { useTransactionHistory } from 'src/hooks/useTransactionHistory';
import TransactionsList from 'src/modules/history/TransactionsList';
import { ContentContainer } from '../src/components/ContentContainer';

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
    return (
        <MainLayout>
            {page}
        </MainLayout>
    );
};

