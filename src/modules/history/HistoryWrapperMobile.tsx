import { DocumentDownloadIcon, SearchIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  SvgIcon,
  Typography,
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { SearchInput } from 'src/components/SearchInput';
import { applyTxHistoryFilters, useTransactionHistory } from 'src/hooks/useTransactionHistory';

import { downloadData, formatTransactionData, groupByDate } from './helpers';
import { HistoryFilterMenu } from './HistoryFilterMenu';
import { HistoryMobileItemLoader } from './HistoryMobileItemLoader';
import TransactionMobileRowItem from './TransactionMobileRowItem';
import { FilterOptions, TransactionHistoryItemUnion } from './types';

export const HistoryWrapperMobile = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterOptions[]>([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchResetKey, setSearchResetKey] = useState(0);
  const [downloadError, setDownloadError] = useState('');

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

  // Create ref to exclude search box from click handler below
  const searchBarRef = useRef<HTMLElement | null>(null);

  // Close search bar if it's open, has a blank query, and the clicked item is not the search box
  const handleClickOutside = (event: MouseEvent) => {
    if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
      if (searchQuery === '' && showSearchBar) {
        handleCancelClick();
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, showSearchBar]);

  const isFilterActive = searchQuery.length > 0 || filterQuery.length > 0;

  const {
    data: transactions,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    fetchForDownload,
  } = useTransactionHistory({ isFilterActive });

  const handleJsonDownload = async () => {
    setLoadingDownload(true);
    setDownloadError('');
    try {
      const data = await fetchForDownload({ searchQuery, filterQuery });
      const formattedData = formatTransactionData({ data, csv: false });
      const jsonData = JSON.stringify(formattedData, null, 2);
      downloadData('transactions.json', jsonData, 'application/json');
      setLoadingDownload(false);
    } catch (error) {
      setLoadingDownload(false);
      console.log('Show an error notification', error);
      setDownloadError(error?.statusText || 'Download Error');
    }
  };

  const handleCsvDownload = async () => {
    setLoadingDownload(true);
    setDownloadError('');
    try {
      setLoadingDownload(true);
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
      setLoadingDownload(false);
    } catch (error) {
      setLoadingDownload(false);
      console.log('Show an error notification', error);
      setDownloadError(error?.statusText || 'Download Error');
    }
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

  const flatTxns = useMemo(
    () => transactions?.pages?.flatMap((page) => page) || [],
    [transactions]
  );
  const filteredTxns = useMemo(
    () => applyTxHistoryFilters({ searchQuery, filterQuery, txns: flatTxns }),
    [searchQuery, filterQuery, flatTxns]
  );
  const isEmpty = filteredTxns.length === 0;
  const filterActive = searchQuery !== '' || filterQuery.length > 0;

  return (
    <ListWrapper
      wrapperSx={showSearchBar ? { px: 4 } : undefined}
      titleComponent={
        <Box
          ref={searchBarRef}
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
              {downloadError && <Alert severity="error"> {downloadError} </Alert>}
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
                key={searchResetKey}
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

      {isLoading ? (
        <>
          <HistoryMobileItemLoader />
          <HistoryMobileItemLoader />
        </>
      ) : !isEmpty ? (
        Object.entries(groupByDate(filteredTxns)).map(([date, txns], groupIndex) => (
          <React.Fragment key={groupIndex}>
            <Typography variant="h4" color="text.primary" sx={{ ml: 4, mt: 6, mb: 2 }}>
              {date}
            </Typography>
            {txns.map((transaction: TransactionHistoryItemUnion, index: number) => {
              const isLastItem = index === txns.length - 1;
              return (
                <div ref={isLastItem ? lastElementRef : null} key={index}>
                  <TransactionMobileRowItem
                    transaction={transaction as TransactionHistoryItemUnion}
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
