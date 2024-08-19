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

  const flatTxns = useMemo(
    () => transactions?.pages?.flatMap((page) => page) || [],
    [transactions]
  );
  const filteredTxns = useMemo(
    () => applyTxHistoryFilters({ searchQuery, filterQuery, txns: flatTxns }),
    [searchQuery, filterQuery, flatTxns]
  );
  // const filteredTxns: TransactionHistoryItemUnion[] = useMemo(
  //   // () => applyTxHistoryFilters({ searchQuery, filterQuery, txns: flatTxns }),
  //   () => [
  //     {
  //       id: '1',
  //       txHash: '0x123',
  //       action: 'Supply',
  //       pool: {
  //         id: 'pool1',
  //       },
  //       timestamp: 1633024800,
  //       reserve: {
  //         symbol: 'ETH',
  //         decimals: 18,
  //         underlyingAsset: '0x0000000000000000000000000000000000000000',
  //         name: 'Ethereum',
  //       },
  //       amount: '1000000000000000000', // 1 ETH in wei
  //       assetPriceUSD: '3000',
  //     },
  //     {
  //       id: '2',
  //       txHash: '0x456',
  //       action: 'Borrow',
  //       pool: {
  //         id: 'pool2',
  //       },
  //       timestamp: 1633025800,
  //       reserve: {
  //         symbol: 'DAI',
  //         decimals: 18,
  //         underlyingAsset: '0x0000000000000000000000000000000000000001',
  //         name: 'Dai Stablecoin',
  //       },
  //       amount: '500000000000000000000', // 500 DAI in wei
  //       assetPriceUSD: '1',
  //       borrowRateModeFrom: 'stable',
  //       borrowRateModeTo: 'variable',
  //       stableBorrowRate: 18
  //     },
  //     {
  //       id: '3',
  //       txHash: '0x789',
  //       action: 'RedeemUnderlying',
  //       pool: {
  //         id: 'pool3',
  //       },
  //       timestamp: 1633026800,
  //       reserve: {
  //         symbol: 'USDC',
  //         decimals: 6,
  //         underlyingAsset: '0x0000000000000000000000000000000000000002',
  //         name: 'USD Coin',
  //       },
  //       amount: '1000000', // 1 USDC in smallest unit
  //       assetPriceUSD: '1',
  //     },
  //     {
  //       id: '4',
  //       txHash: '0xabc',
  //       action: 'Deposit',
  //       pool: {
  //         id: 'pool4',
  //       },
  //       timestamp: 1633027800,
  //       reserve: {
  //         symbol: 'BTC',
  //         decimals: 8,
  //         underlyingAsset: '0x0000000000000000000000000000000000000003',
  //         name: 'Bitcoin',
  //       },
  //       amount: '100000000', // 1 BTC in satoshi
  //       assetPriceUSD: '50000',
  //     },
  //     {
  //       id: '5',
  //       txHash: '0xdef',
  //       action: 'Repay',
  //       pool: {
  //         id: 'pool5',
  //       },
  //       timestamp: 1633028800,
  //       reserve: {
  //         symbol: 'ETH',
  //         decimals: 18,
  //         underlyingAsset: '0x0000000000000000000000000000000000000000',
  //         name: 'Ethereum',
  //       },
  //       amount: '2000000000000000000', // 2 ETH in wei
  //       assetPriceUSD: '3000',
  //     },
  //     {
  //       id: '6',
  //       txHash: '0xghi',
  //       action: 'UsageAsCollateral',
  //       pool: {
  //         id: 'pool6',
  //       },
  //       timestamp: 1633029800,
  //       reserve: {
  //         symbol: 'DAI',
  //         decimals: 18,
  //         underlyingAsset: '0x0000000000000000000000000000000000000001',
  //         name: 'Dai Stablecoin',
  //       },
  //       amount: '1000000000000000000000', // 1000 DAI in wei
  //       assetPriceUSD: '1',
  //     },
  //     {
  //       id: '7',
  //       txHash: '0xjkl',
  //       action: 'SwapBorrowRate',
  //       pool: {
  //         id: 'pool7',
  //       },
  //       timestamp: 1623030800,
  //       reserve: {
  //         symbol: 'USDT',
  //         decimals: 6,
  //         underlyingAsset: '0x0000000000000000000000000000000000000004',
  //         name: 'Tether',
  //       },
  //       amount: '5000000', // 5 USDT in smallest unit
  //       assetPriceUSD: '1',
  //       borrowRateModeFrom: 'stable',
  //       borrowRateModeTo: 'variable',
  //       stableBorrowRate: 18,
  //       variableBorrowRate: 20
  //     },
  //     {
  //       id: '8',
  //       txHash: '0xmn0',
  //       action: 'Swap',
  //       pool: {
  //         id: 'pool8',
  //       },
  //       timestamp: 1633031800,
  //       reserve: {
  //         symbol: 'ETH',
  //         decimals: 18,
  //         underlyingAsset: '0x0000000000000000000000000000000000000000',
  //         name: 'Ethereum',
  //       },
  //       amount: '3000000000000000000', // 3 ETH in wei
  //       assetPriceUSD: '3000',
  //       swapFromReserve: {
  //         symbol: 'DAI',
  //         decimals: 18,
  //         underlyingAsset: '0x0000000000000000000000000000000000000001',
  //         name: 'Dai Stablecoin',
  //       },
  //       swapToReserve: {
  //         symbol: 'USDC',
  //         decimals: 6,
  //         underlyingAsset: '0x0000000000000000000000000000000000000002',
  //         name: 'USD Coin',
  //       },
  //       borrowRateModeFrom: 'Variable',
  //       borrowRateModeTo: 'variable',
  //       stableBorrowRate: 18,
  //       variableBorrowRate: 20
  //     },
  //     {
  //       id: '9',
  //       txHash: '0xpqr',
  //       action: 'LiquidationCall',
  //       pool: {
  //         id: 'pool9',
  //       },
  //       timestamp: 1633032800,
  //       collateralReserve: {
  //         symbol: 'USDC',
  //         decimals: 6,
  //         underlyingAsset: '0x0000000000000000000000000000000000000002',
  //         name: 'USD Coin',
  //       },
  //       collateralAmount: '2000000', // 2 USDC in smallest unit
  //       principalReserve: {
  //         symbol: 'ETH',
  //         decimals: 18,
  //         underlyingAsset: '0x0000000000000000000000000000000000000000',
  //         name: 'Ethereum',
  //       },
  //       principalAmount: '4000000000000000000', // 4 ETH in wei
  //       borrowAssetPriceUSD: '3000',
  //       collateralAssetPriceUSD: '1',
  //     },
  //   ],
  //   [searchQuery, filterQuery, flatTxns]
  // );
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
              <Trans>Transactions1</Trans>
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
