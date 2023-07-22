import { DocumentDownloadIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { WarningRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { CustomTooltip } from 'src/components/infoTooltips/CustomToolTip';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { SearchInput } from 'src/components/SearchInput';
import { applyTxHistoryFilters, useTransactionHistory } from 'src/hooks/useTransactionHistory';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { TRANSACTION_HISTORY } from 'src/utils/mixPanelEvents';

import LoveGhost from '/public/loveGhost.svg';

import { downloadData, formatTransactionData, groupByDate } from './helpers';
import { HistoryFilterMenu } from './HistoryFilterMenu';
import { HistoryItemLoader } from './HistoryItemLoader';
import { HistoryWrapperMobile } from './HistoryWrapperMobile';
import TransactionRowItem from './TransactionRowItem';
import { FilterOptions, TransactionHistoryItemUnion } from './types';

enum downloadState {
  NEUTRAL,
  LOADING,
  ERROR,
  SUCCESS,
}

export const HistoryWrapper = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState<FilterOptions[]>([]);
  const [searchResetKey, setSearchResetKey] = useState(0);

  const [downloadError, setDownloadError] = useState<JSX.Element | null>(null);
  const [jsonFileDownload, setJsonFileDownload] = useState(downloadState.NEUTRAL);
  const [csvFileDownload, setCsvFileDownload] = useState(downloadState.NEUTRAL);

  const isFilterActive = searchQuery.length > 0 || filterQuery.length > 0;
  const trackEvent = useRootStore((store) => store.trackEvent);

  const {
    data: transactions,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    fetchForDownload,
    subgraphUrl,
  } = useTransactionHistory({ isFilterActive });

  const handleJsonDownload = async () => {
    trackEvent(TRANSACTION_HISTORY.DOWNLOAD, { type: 'JSON' });
    setDownloadError(null);
    setJsonFileDownload(downloadState.LOADING);
    try {
      const data = await fetchForDownload({ searchQuery, filterQuery });
      const formattedData = formatTransactionData({ data, csv: false });
      const jsonData = JSON.stringify(formattedData, null, 2);
      downloadData('transactions.json', jsonData, 'application/json');
      setJsonFileDownload(downloadState.SUCCESS);
      setTimeout(() => setJsonFileDownload(downloadState.NEUTRAL), 4000);
    } catch (errors) {
      showDownloadError(errors);
      setJsonFileDownload(downloadState.ERROR);
    }
  };

  const handleCsvDownload = async () => {
    trackEvent(TRANSACTION_HISTORY.DOWNLOAD, { type: 'CSV' });
    setDownloadError(null);
    setCsvFileDownload(downloadState.LOADING);
    try {
      const data: TransactionHistoryItemUnion[] = await fetchForDownload({
        searchQuery,
        filterQuery,
      });
      const formattedData = formatTransactionData({ data, csv: true });
      // Getting all the unique headers
      const headersSet = new Set<string>();
      formattedData.forEach((transaction: TransactionHistoryItemUnion) => {
        Object.keys(transaction).forEach((key) => headersSet.add(key));
      });

      const headers: string[] = Array.from(headersSet);
      let csvContent = headers.join(',') + '\n';

      formattedData.forEach((transaction: TransactionHistoryItemUnion) => {
        const row: string[] = headers.map((header) => {
          const value = transaction[header as keyof TransactionHistoryItemUnion];
          if (typeof value === 'object') {
            return JSON.stringify(value) ?? '';
          }
          return String(value) ?? '';
        });
        csvContent += row.join(',') + '\n';
      });

      downloadData('transactions.csv', csvContent, 'text/csv');
      setCsvFileDownload(downloadState.SUCCESS);
      setTimeout(() => setCsvFileDownload(downloadState.NEUTRAL), 4000);
    } catch (errors) {
      console.log('Show an error notification', errors);
      showDownloadError(errors);
      setCsvFileDownload(downloadState.ERROR);
    }
  };

  const showDownloadError = (errors: { message: string }[]) => {
    if (errors[0] && errors[0].message) {
      const errorMessage = (
        <>
          Failed to download file.{' '}
          <span onClick={() => handleCopyClick(errors[0].message)} style={{ cursor: 'pointer' }}>
            Copy Error
          </span>
        </>
      );
      setDownloadError(errorMessage);
    } else {
      const errorMessage = (
        <p>Failed to download file. Please check your internet connection and try again</p>
      );
      setDownloadError(errorMessage);
    }
  };

  const handleCopyClick = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
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
  const downToMD = useMediaQuery(theme.breakpoints.down('md'));
  const { currentAccount, loading: web3Loading } = useWeb3Context();

  const flatTxns = useMemo(
    () => transactions?.pages?.flatMap((page) => page) || [],
    [transactions]
  );
  const filteredTxns = useMemo(
    () => applyTxHistoryFilters({ searchQuery, filterQuery, txns: flatTxns }),
    [searchQuery, filterQuery, flatTxns]
  );

  if (!subgraphUrl) {
    return (
      <Paper
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
        <LoveGhost style={{ marginBottom: '16px' }} />
        <Typography variant={downToMD ? 'h4' : 'h3'}>
          <Trans>Transaction history is not currently available for this market</Trans>
        </Typography>
      </Paper>
    );
  }

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

  const isEmpty = filteredTxns.length === 0;
  const filterActive = searchQuery !== '' || filterQuery.length > 0;

  const transactionDownloadButton = (
    text: ReactNode,
    fileDownloadState: downloadState,
    downloadHandler: () => void
  ) => {
    return (
      <CustomTooltip
        title={fileDownloadState === downloadState.ERROR ? downloadError : ''}
        arrow={true}
        wrap={true}
        placement="top"
      >
        <Button onClick={downloadHandler}>
          {fileDownloadState === downloadState.NEUTRAL ? (
            <SvgIcon>
              <DocumentDownloadIcon width={22} height={22} />
            </SvgIcon>
          ) : fileDownloadState === downloadState.LOADING ? (
            <CircularProgress size={16} sx={{ mr: 2 }} color="inherit" />
          ) : fileDownloadState === downloadState.ERROR ? (
            <SvgIcon>
              <WarningRounded width={22} height={22} />
            </SvgIcon>
          ) : (
            fileDownloadState === downloadState.SUCCESS && (
              <SvgIcon>
                <CheckIcon width={22} height={22} />
              </SvgIcon>
            )
          )}
          <Typography variant="buttonM">{text}</Typography>
        </Button>
      </CustomTooltip>
    );
  };

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
            key={searchResetKey}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: 36,
            gap: 0.5,
            cursor: isEmpty ? 'not-allowed' : 'pointer',
          }}
        >
          {transactionDownloadButton(<Trans>.CSV</Trans>, csvFileDownload, handleCsvDownload)}
          {transactionDownloadButton(<Trans>.JSON</Trans>, jsonFileDownload, handleJsonDownload)}
        </Box>
      </Box>

      {isLoading ? (
        <>
          <HistoryItemLoader />
          <HistoryItemLoader />
        </>
      ) : !isEmpty ? (
        Object.entries(groupByDate(filteredTxns)).map(([date, txns], groupIndex) => (
          <React.Fragment key={groupIndex}>
            <Typography variant="h4" color="text.primary" sx={{ ml: 9, mt: 6, mb: 2 }}>
              {date}
            </Typography>
            {txns.map((transaction: TransactionHistoryItemUnion, index: number) => {
              const isLastItem = index === txns.length - 1;
              return (
                <div ref={isLastItem ? lastElementRef : null} key={index}>
                  <TransactionRowItem transaction={transaction as TransactionHistoryItemUnion} />
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
              setSearchResetKey((prevKey) => prevKey + 1); // Remount SearchInput component to clear search query
            }}
          >
            Reset Filters
          </Button>
        </Box>
      ) : !isFetchingNextPage ? (
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
      ) : (
        <></>
      )}

      <Box
        sx={{ display: 'flex', justifyContent: 'center', mb: isFetchingNextPage ? 6 : 0, mt: 10 }}
      >
        {isFetchingNextPage && (
          <Box
            sx={{
              height: 36,
              width: 186,
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
