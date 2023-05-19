import { DocumentDownloadIcon, SearchIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useCallback, useRef, useState } from 'react';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { SearchInput } from 'src/components/SearchInput';
import {
  ActionFields,
  applyTxHistoryFilters,
  TransactionHistoryItem,
  useTransactionHistory,
} from 'src/hooks/useTransactionHistory';

import { downloadData } from './downloadHelper';
import { FilterOptions, HistoryFilterMenu } from './HistoryFilterMenu';
import { HistoryItemLoader } from './HistoryItemLoader';
import { HistoryMobileItemLoader } from './HistoryMobileItemLoader';
import TransactionMobileRowItem from './TransactionMobileRowItem';

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

export const HistoryWrapperMobile = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterOptions[]>([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleDownloadMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleCancelClick = () => {
    setShowSearchBar(false);
    setSearchQuery('');
  };

  const {
    data: transactions,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    fetchForDownload,
  } = useTransactionHistory();

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

  const flatTxns = transactions?.pages?.flatMap((page) => page) || [];
  const filteredTxns = applyTxHistoryFilters({ searchQuery, filterQuery, txns: flatTxns });
  const isEmpty = filteredTxns.length === 0;
  const filterActive = searchQuery !== '' || filterQuery.length > 0;

  return (
    <ListWrapper
      wrapperSx={showSearchBar ? { px: 4 } : undefined}
      titleComponent={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            alignItems: 'center',
          }}
        >
          {!showSearchBar && (
            <Typography component="div" variant="h2" sx={{ mr: 4, height: '36px' }}>
              <Trans>Transactions</Trans>
            </Typography>
          )}
          {!showSearchBar && (
            <Box sx={{ display: 'flex', gap: '22px' }}>
              {loadingDownload && <CircularProgress size={20} sx={{ mr: 2 }} color="inherit" />}
              <Box onClick={handleDownloadMenuClick} sx={{ cursor: 'pointer' }}>
                <SvgIcon>
                  <DocumentDownloadIcon width={20} height={20} />
                </SvgIcon>
              </Box>
              <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleDownloadMenuClose}
              >
                <Typography variant="subheader2" color="text.secondary" sx={{ mx: 4, my: 3 }}>
                  <Trans>Export data to</Trans>
                </Typography>
                <MenuItem
                  onClick={() => {
                    handleJsonDownload();
                    handleDownloadMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <SvgIcon>
                      <DocumentDownloadIcon width={22} height={22} />
                    </SvgIcon>
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: 'subheader1' }}>
                    <Trans>.JSON</Trans>
                  </ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleCsvDownload();
                    handleDownloadMenuClose();
                  }}
                >
                  <ListItemIcon>
                    <SvgIcon>
                      <DocumentDownloadIcon width={22} height={22} />
                    </SvgIcon>
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: 'subheader1' }}>
                    <Trans>.CSV</Trans>
                  </ListItemText>
                </MenuItem>
              </Menu>
              <Box onClick={() => setShowSearchBar(true)}>
                <SvgIcon sx={{ cursor: 'pointer' }}>
                  <SearchIcon width={20} height={20} />
                </SvgIcon>
              </Box>
            </Box>
          )}
          {showSearchBar && (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', px: 0 }}>
              <SearchInput
                wrapperSx={{
                  width: '320px',
                }}
                placeholder="Search assets..."
                onSearchTermChange={setSearchQuery}
              />
              <Button onClick={() => handleCancelClick()}>
                <Typography variant="buttonM">
                  <Trans>Cancel</Trans>
                </Typography>
              </Button>
            </Box>
          )}
        </Box>
      }
    >
      <HistoryFilterMenu onFilterChange={setFilterQuery} currentFilter={filterQuery} />

      {isLoading &&
        (downToXSM ? (
          <>
            <HistoryMobileItemLoader />
            <HistoryMobileItemLoader />
          </>
        ) : (
          <>
            <HistoryItemLoader />
            <HistoryItemLoader />
          </>
        ))}

      {!isEmpty ? (
        Object.entries(groupByDate(filteredTxns)).map(([date, txns], groupIndex) => (
          <React.Fragment key={groupIndex}>
            <Typography variant="h4" color="text.primary" sx={{ ml: 4, mt: 6, mb: 2 }}>
              {date}
            </Typography>
            {txns.map((transaction: TransactionHistoryItem, index: number) => {
              const isLastItem = index === txns.length - 1;
              return (
                <div ref={isLastItem ? lastElementRef : null} key={index}>
                  <TransactionMobileRowItem
                    transaction={
                      transaction as TransactionHistoryItem & ActionFields[keyof ActionFields]
                    }
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
