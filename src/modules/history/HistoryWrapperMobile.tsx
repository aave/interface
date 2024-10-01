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
} from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { SearchInput } from 'src/components/SearchInput';
import { applyTxHistoryFilters, useTransactionHistory } from 'src/hooks/useTransactionHistory';
import { useTransactionHistoryTonNetwork } from 'src/hooks/useTransactionHistoryTonNetwork';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useRootStore } from 'src/store/root';

import { downloadData, formatTransactionData, groupByDate } from './helpers';
import { HistoryFilterMenu } from './HistoryFilterMenu';
import { HistoryMobileItemLoader } from './HistoryMobileItemLoader';
import TransactionMobileRowItem from './TransactionMobileRowItem';
import {
  ACTION_HISTORY,
  defaultNameAsset,
  defaultUnderlyingAsset,
  FilterOptions,
  TransactionHistoryItemUnion,
} from './types';

export const HistoryWrapperMobile = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterOptions[]>([]);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [searchResetKey, setSearchResetKey] = useState(0);
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const { isConnectedTonWallet } = useTonConnectContext();
  const checkTonNetwork = isConnectedTonWallet && currentMarketData.marketTitle === 'TON';

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
    data: transactionsMain,
    isLoading: isLoadingMain,
    fetchNextPage,
    isFetchingNextPage: isFetchingNextPageMain,
    fetchForDownload,
    subgraphUrl,
  } = useTransactionHistory({ isFilterActive });

  const { data: transactionsTonNetwork, isLoading: isLoadingTonNetwork } =
    useTransactionHistoryTonNetwork({});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transactions: any = checkTonNetwork ? transactionsTonNetwork : transactionsMain;
  const isLoading = checkTonNetwork ? isLoadingTonNetwork : isLoadingMain;
  const isFetchingNextPage = checkTonNetwork ? false : isFetchingNextPageMain;
  console.log('🚀 ~ isLoading mobile:', isLoading);
  console.log('🚀 ~ transactions mobile:', transactions);

  const handleJsonDownload = async () => {
    setLoadingDownload(true);
    const data = await fetchForDownload({ searchQuery, filterQuery });
    const formattedData = formatTransactionData({ data, csv: false });
    const jsonData = JSON.stringify(formattedData, null, 2);
    downloadData('transactions.json', jsonData, 'application/json');
    setLoadingDownload(false);
  };

  const handleCsvDownload = async () => {
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

  const flatTxns = useMemo(() => {
    console.log('Transactions mobile updated: ', transactions);
    if (checkTonNetwork) {
      return transactions || [];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return transactions?.pages?.flatMap((page: any) => page) || [];
  }, [transactions]);

  const filteredTxns: TransactionHistoryItemUnion[] = useMemo(() => {
    const txnArray = Array.isArray(flatTxns) ? flatTxns : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatedTxns = txnArray.map((item: any) => {
      const action = ACTION_HISTORY[item.opCode as keyof typeof ACTION_HISTORY] || 'Unknown Action';

      const poolId = item.pool ?? null;
      if (poolId) {
        item = { ...item };
        delete item.pool;
      }

      const underlyingAsset =
        defaultUnderlyingAsset[item.symbol as keyof typeof defaultUnderlyingAsset];
      const name = defaultNameAsset[item.symbol as keyof typeof defaultNameAsset];

      const reserveName = name || 'Unknown Name';
      const reserveAsset = underlyingAsset || 'Unknown Asset';
      const collateralStatus = item.collateralStatus === 'disable' ? false : true;

      if (
        action === 'Supply' ||
        action === 'Repay' ||
        action === 'Withdraw' ||
        action === 'Borrow' ||
        action === 'UsageAsCollateral' ||
        action === 'RedeemUnderlying'
      ) {
        item.pool = {
          id: poolId,
        };
        item.reserve = {
          symbol: item.symbol,
          decimals: item.decimals,
          underlyingAsset: reserveAsset,
          name: reserveName,
        };
      } else {
        console.log('Item not match with action: ', item);
      }
      const iconSymbol = item.symbol;
      return { ...item, action, iconSymbol, toState: collateralStatus };
    });

    return applyTxHistoryFilters({ searchQuery, filterQuery, txns: updatedTxns });
  }, [searchQuery, filterQuery, flatTxns]);

  const isEmpty = filteredTxns.length === 0;
  const filterActive = searchQuery !== '' || filterQuery.length > 0;

  return (
    <ListWrapper
      wrapperSx={showSearchBar ? { px: 5, py: 9 } : undefined}
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
              {!checkTonNetwork && (
                <Box onClick={handleDownloadMenuClick} sx={{ cursor: 'pointer' }}>
                  <SvgIcon>
                    <DocumentDownloadIcon width={20} height={20} />
                  </SvgIcon>
                </Box>
              )}
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
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                px: 0,
              }}
            >
              <SearchInput
                wrapperSx={{
                  width: '320px',
                }}
                placeholder="Search assets..."
                onSearchTermChange={setSearchQuery}
                key={searchResetKey}
              />
              <Button onClick={() => handleCancelClick()} style={{ marginTop: '10px' }}>
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
            <Typography variant="body4" color="text.subTitle" sx={{ ml: 4, mt: 6, mb: 2 }}>
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
