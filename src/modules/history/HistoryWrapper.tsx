import { DocumentDownloadIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  CircularProgress,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { SearchInput } from 'src/components/SearchInput';
import {
  ActionFields,
  applyTxHistoryFilters,
  TransactionHistoryItem,
  useTransactionHistory,
} from 'src/hooks/useTransactionHistory';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { FilterOptions, HistoryFilterMenu } from './HistoryFilterMenu';
import { HistoryItemLoader } from './HistoryItemLoader';
import { HistoryWrapperMobile } from './HistoryWrapperMobile';
import TransactionRowItem from './TransactionRowItem';

const groupByDate = (
  transactions: TransactionHistoryItem[]
): Record<string, TransactionHistoryItem[]> => {
  return transactions.reduce((grouped, transaction) => {
    const date = new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(transaction.timestamp * 1000));
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(transaction);
    return grouped;
  }, {} as Record<string, TransactionHistoryItem[]>);
};

export const HistoryWrapper = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterOptions[]>([]);

  const {
    data: transactions,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    fetchForDownload,
  } = useTransactionHistory();

  const downloadData = (fileName: string, content: string, mimeType: string) => {
    const file = new Blob([content], { type: mimeType });
    const downloadUrl = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
  };

  const handleJsonDownload = async () => {
    setLoadingDownload(true);
    const data = await fetchForDownload({ searchQuery, filterQuery });
    const jsonData = JSON.stringify(data, null, 2);
    downloadData('transactions.json', jsonData, 'application/json');
    setLoadingDownload(false);
  };

  const handleCsvDownload = async () => {
    setLoadingDownload(true);
    const data: TransactionHistoryItem[] = await fetchForDownload({ searchQuery, filterQuery });

    // Getting all the unique headers
    const headersSet = new Set<string>();
    data.forEach((transaction) => {
      Object.keys(transaction).forEach((key) => headersSet.add(key));
    });

    const headers: string[] = Array.from(headersSet);
    let csvContent = headers.join(',') + '\n';

    data.forEach((transaction: TransactionHistoryItem) => {
      const row: string[] = headers.map((header) => {
        const value = transaction[header as keyof TransactionHistoryItem];
        if (typeof value === 'object') {
          return JSON.stringify(value) ?? '';
        }
        return String(value) ?? '';
      });
      csvContent += row.join(',') + '\n';
    });

    downloadData('transactions.csv', csvContent, 'text/csv');
    setLoadingDownload(false);
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchNextPage, isLoading]
  );
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const downToMD = useMediaQuery(theme.breakpoints.down('md'));
  const { currentAccount, loading: web3Loading } = useWeb3Context();

  if (!currentAccount) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans> Please connect your wallet to view transaction history.</Trans>}
      />
    );
  }

  if (downToMD) {
    return <HistoryWrapperMobile />;
  }

  const flatTxns = transactions?.pages?.flatMap((page) => page) || [];
  const filteredTxns = applyTxHistoryFilters({ searchQuery, filterQuery, txns: flatTxns });
  const isEmpty = filteredTxns.length === 0;
  const filterActive = searchQuery !== '' || filterQuery.length > 0;

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h2" sx={{ mr: 4 }}>
          <Trans>Transactions</Trans>
        </Typography>
      }
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mx: 8, mt: 6, mb: 4 }}>
        <Box sx={{ display: 'inline-flex' }}>
          <HistoryFilterMenu onFilterChange={setFilterQuery} currentFilter={filterQuery} />
          <SearchInput
            onSearchTermChange={setSearchQuery}
            placeholder="Search assets..."
            wrapperSx={{ width: '280px' }}
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', height: 36, gap: 0.5 }}>
          {loadingDownload && <CircularProgress size={16} sx={{ mr: 2 }} color="inherit" />}
          <Box
            sx={{
              cursor: 'pointer',
              color: 'primary',
              height: 'auto',
              width: 'auto',
              display: 'flex',
              alignItems: 'center',
              mr: 6,
            }}
            onClick={handleCsvDownload}
          >
            <SvgIcon>
              <DocumentDownloadIcon width={22} height={22} />
            </SvgIcon>
            <Typography variant="buttonM" color="text.primary">
              <Trans>.CSV</Trans>
            </Typography>
          </Box>
          <Box
            sx={{
              cursor: 'pointer',
              color: 'primary',
              height: 'auto',
              width: 'auto',
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={handleJsonDownload}
          >
            <SvgIcon>
              <DocumentDownloadIcon width={22} height={22} />
            </SvgIcon>
            <Typography variant="buttonM" color="text.primary">
              <Trans>.JSON</Trans>
            </Typography>
          </Box>
        </Box>
      </Box>

      {isLoading && (
        <>
          <HistoryItemLoader />
          <HistoryItemLoader />
        </>
      )}

      {!isEmpty ? (
        Object.entries(groupByDate(filteredTxns)).map(([date, txns], groupIndex) => (
          <React.Fragment key={groupIndex}>
            <Typography variant="h4" color="text.primary" sx={{ ml: 9, mt: 6, mb: 2 }}>
              {date}
            </Typography>
            {txns.map((transaction: TransactionHistoryItem, index: number) => {
              const isLastItem = index === txns.length - 1;
              return (
                <div ref={isLastItem ? lastElementRef : null} key={index}>
                  <TransactionRowItem
                    transaction={
                      transaction as TransactionHistoryItem & ActionFields[keyof ActionFields]
                    }
                    downToXSM={downToXSM}
                  />
                </div>
              );
            })}
          </React.Fragment>
        ))
      ) : filterActive ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 4,
            flex: 1,
            maxWidth: '468px',
            margin: '0 auto',
            my: 24,
          }}
        >
          <Typography variant="h3" color="text.primary">
            <Trans>Nothing found</Trans>
          </Typography>
          <Typography sx={{ mt: 1, mb: 4 }} variant="description" color="text.secondary">
            <Trans>
              We couldn&apos;t find any transactions related to your search. Try again with a
              different asset name, or reset filters.
            </Trans>
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchQuery('');
              setFilterQuery([]);
            }}
          >
            Reset Filters
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            p: 4,
            flex: 1,
          }}
        >
          <Typography sx={{ my: 24 }} variant="h3" color="text.primary">
            <Trans>No transactions yet.</Trans>
          </Typography>
        </Box>
      )}

      <Box
        sx={{ display: 'flex', justifyContent: 'center', mb: isFetchingNextPage ? 6 : 0, mt: 10 }}
      >
        {isFetchingNextPage && (
          <Box
            sx={{
              height: 36,
              width: 186,
              backgroundColor: '#EAEBEF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={20} style={{ color: '#383D51' }} />
          </Box>
        )}
      </Box>
    </ListWrapper>
  );
};

export default HistoryWrapper;
