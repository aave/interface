import { DocumentDownloadIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
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
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { SearchInput } from 'src/components/SearchInput';
import { applyTxHistoryFilters, useTransactionHistory } from 'src/hooks/useTransactionHistory';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { TRANSACTION_HISTORY } from 'src/utils/mixPanelEvents';

import { downloadData, formatTransactionData, groupByDate } from './helpers';
import { HistoryFilterMenu } from './HistoryFilterMenu';
import { HistoryItemLoader } from './HistoryItemLoader';
import { HistoryWrapperMobile } from './HistoryWrapperMobile';
import TransactionRowItem from './TransactionRowItem';
import { FilterOptions, TransactionHistoryItemUnion } from './types';

export const HistoryWrapper = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [filterQuery, setFilterQuery] = useState<FilterOptions[]>([]);
  const [searchResetKey, setSearchResetKey] = useState(0);

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
    setLoadingDownload(true);
    const data = await fetchForDownload({ searchQuery, filterQuery });
    const formattedData = formatTransactionData({ data, csv: false });
    const jsonData = JSON.stringify(formattedData, null, 2);
    downloadData('transactions.json', jsonData, 'application/json');
    setLoadingDownload(false);
  };

  const handleCsvDownload = async () => {
    trackEvent(TRANSACTION_HISTORY.DOWNLOAD, { type: 'CSV' });

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
  const theme = useTheme();
  const downToMD = useMediaQuery(theme.breakpoints.down('md'));
  const { currentAccount, loading: web3Loading } = useWeb3Context();

  const flatTxns = useMemo(
    () => transactions?.pages?.flatMap((page) => page) || [],
    [transactions]
  );
  const filteredTxns: TransactionHistoryItemUnion[] = useMemo(
    () => applyTxHistoryFilters({ searchQuery, filterQuery, txns: flatTxns }),
    // () => [
    //   {
    //     id: '1',
    //     txHash: '0x123',
    //     action: 'Supply',
    //     pool: {
    //       id: 'pool1',
    //     },
    //     timestamp: 1633024800,
    //     reserve: {
    //       symbol: 'ETH',
    //       decimals: 18,
    //       underlyingAsset: '0x0000000000000000000000000000000000000000',
    //       name: 'Ethereum',
    //     },
    //     amount: '1000000000000000000', // 1 ETH in wei
    //     assetPriceUSD: '3000',
    //   },
    //   {
    //     id: '2',
    //     txHash: '0x456',
    //     action: 'Borrow',
    //     pool: {
    //       id: 'pool2',
    //     },
    //     timestamp: 1633025800,
    //     reserve: {
    //       symbol: 'DAI',
    //       decimals: 18,
    //       underlyingAsset: '0x0000000000000000000000000000000000000001',
    //       name: 'Dai Stablecoin',
    //     },
    //     amount: '500000000000000000000', // 500 DAI in wei
    //     assetPriceUSD: '1',
    //     borrowRateModeFrom: 'stable',
    //     borrowRateModeTo: 'variable',
    //     stableBorrowRate: 18
    //   },
    //   {
    //     id: '3',
    //     txHash: '0x789',
    //     action: 'RedeemUnderlying',
    //     pool: {
    //       id: 'pool3',
    //     },
    //     timestamp: 1633026800,
    //     reserve: {
    //       symbol: 'USDC',
    //       decimals: 6,
    //       underlyingAsset: '0x0000000000000000000000000000000000000002',
    //       name: 'USD Coin',
    //     },
    //     amount: '1000000', // 1 USDC in smallest unit
    //     assetPriceUSD: '1',
    //   },
    //   {
    //     id: '4',
    //     txHash: '0xabc',
    //     action: 'Deposit',
    //     pool: {
    //       id: 'pool4',
    //     },
    //     timestamp: 1633027800,
    //     reserve: {
    //       symbol: 'BTC',
    //       decimals: 8,
    //       underlyingAsset: '0x0000000000000000000000000000000000000003',
    //       name: 'Bitcoin',
    //     },
    //     amount: '100000000', // 1 BTC in satoshi
    //     assetPriceUSD: '50000',
    //   },
    //   {
    //     id: '5',
    //     txHash: '0xdef',
    //     action: 'Repay',
    //     pool: {
    //       id: 'pool5',
    //     },
    //     timestamp: 1633028800,
    //     reserve: {
    //       symbol: 'ETH',
    //       decimals: 18,
    //       underlyingAsset: '0x0000000000000000000000000000000000000000',
    //       name: 'Ethereum',
    //     },
    //     amount: '2000000000000000000', // 2 ETH in wei
    //     assetPriceUSD: '3000',
    //   },
    //   {
    //     id: '6',
    //     txHash: '0xghi',
    //     action: 'UsageAsCollateral',
    //     pool: {
    //       id: 'pool6',
    //     },
    //     timestamp: 1633029800,
    //     reserve: {
    //       symbol: 'DAI',
    //       decimals: 18,
    //       underlyingAsset: '0x0000000000000000000000000000000000000001',
    //       name: 'Dai Stablecoin',
    //     },
    //     amount: '1000000000000000000000', // 1000 DAI in wei
    //     assetPriceUSD: '1',
    //   },
    //   {
    //     id: '7',
    //     txHash: '0xjkl',
    //     action: 'SwapBorrowRate',
    //     pool: {
    //       id: 'pool7',
    //     },
    //     timestamp: 1623030800,
    //     reserve: {
    //       symbol: 'USDT',
    //       decimals: 6,
    //       underlyingAsset: '0x0000000000000000000000000000000000000004',
    //       name: 'Tether',
    //     },
    //     amount: '5000000', // 5 USDT in smallest unit
    //     assetPriceUSD: '1',
    //     borrowRateModeFrom: 'stable',
    //     borrowRateModeTo: 'variable',
    //     stableBorrowRate: 18,
    //     variableBorrowRate: 20
    //   },
    //   {
    //     id: '8',
    //     txHash: '0xmn0',
    //     action: 'Swap',
    //     pool: {
    //       id: 'pool8',
    //     },
    //     timestamp: 1633031800,
    //     reserve: {
    //       symbol: 'ETH',
    //       decimals: 18,
    //       underlyingAsset: '0x0000000000000000000000000000000000000000',
    //       name: 'Ethereum',
    //     },
    //     amount: '3000000000000000000', // 3 ETH in wei
    //     assetPriceUSD: '3000',
    //     swapFromReserve: {
    //       symbol: 'DAI',
    //       decimals: 18,
    //       underlyingAsset: '0x0000000000000000000000000000000000000001',
    //       name: 'Dai Stablecoin',
    //     },
    //     swapToReserve: {
    //       symbol: 'USDC',
    //       decimals: 6,
    //       underlyingAsset: '0x0000000000000000000000000000000000000002',
    //       name: 'USD Coin',
    //     },
    //     borrowRateModeFrom: 'Variable',
    //     borrowRateModeTo: 'variable',
    //     stableBorrowRate: 18,
    //     variableBorrowRate: 20
    //   },
    //   {
    //     id: '9',
    //     txHash: '0xpqr',
    //     action: 'LiquidationCall',
    //     pool: {
    //       id: 'pool9',
    //     },
    //     timestamp: 1633032800,
    //     collateralReserve: {
    //       symbol: 'USDC',
    //       decimals: 6,
    //       underlyingAsset: '0x0000000000000000000000000000000000000002',
    //       name: 'USD Coin',
    //     },
    //     collateralAmount: '2000000', // 2 USDC in smallest unit
    //     principalReserve: {
    //       symbol: 'ETH',
    //       decimals: 18,
    //       underlyingAsset: '0x0000000000000000000000000000000000000000',
    //       name: 'Ethereum',
    //     },
    //     principalAmount: '4000000000000000000', // 4 ETH in wei
    //     borrowAssetPriceUSD: '3000',
    //     collateralAssetPriceUSD: '1',
    //   },
    // ],
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

  return (
    <ListWrapper
      paperSx={(theme) => ({ backgroundColor: theme.palette.background.primary })}
      titleComponent={
        <Typography component="div" variant="h2" sx={{ mr: 4 }}>
          <Trans>Transactions</Trans>
        </Typography>
      }
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'inline-flex' }}>
          <HistoryFilterMenu onFilterChange={setFilterQuery} currentFilter={filterQuery} />
          <SearchInput
            onSearchTermChange={setSearchQuery}
            placeholder="Search assets..."
            wrapperSx={{ width: '280px', ml: 2 }}
            key={searchResetKey}
          />
        </Box>
        {/*<Box sx={{ display: 'flex', alignItems: 'center', height: 36, gap: 0.5 }}>*/}
        {/*  {loadingDownload && <CircularProgress size={16} sx={{ mr: 2 }} color="inherit" />}*/}
        {/*  <Box*/}
        {/*    sx={{*/}
        {/*      cursor: 'pointer',*/}
        {/*      color: 'primary',*/}
        {/*      height: 'auto',*/}
        {/*      width: 'auto',*/}
        {/*      display: 'flex',*/}
        {/*      alignItems: 'center',*/}
        {/*      mr: 6,*/}
        {/*    }}*/}
        {/*    onClick={handleCsvDownload}*/}
        {/*  >*/}
        {/*    <SvgIcon>*/}
        {/*      <DocumentDownloadIcon width={22} height={22} />*/}
        {/*    </SvgIcon>*/}
        {/*    <Typography variant="buttonM" color="text.primary">*/}
        {/*      <Trans>.CSV</Trans>*/}
        {/*    </Typography>*/}
        {/*  </Box>*/}
        {/*  <Box*/}
        {/*    sx={{*/}
        {/*      cursor: 'pointer',*/}
        {/*      color: 'primary',*/}
        {/*      height: 'auto',*/}
        {/*      width: 'auto',*/}
        {/*      display: 'flex',*/}
        {/*      alignItems: 'center',*/}
        {/*    }}*/}
        {/*    onClick={handleJsonDownload}*/}
        {/*  >*/}
        {/*    <SvgIcon>*/}
        {/*      <DocumentDownloadIcon width={22} height={22} />*/}
        {/*    </SvgIcon>*/}
        {/*    <Typography variant="buttonM" color="text.primary">*/}
        {/*      <Trans>.JSON</Trans>*/}
        {/*    </Typography>*/}
        {/*  </Box>*/}
        {/*</Box>*/}
      </Box>

      {isLoading ? (
        <>
          <HistoryItemLoader />
          <HistoryItemLoader />
        </>
      ) : !isEmpty ? (
        Object.entries(groupByDate(filteredTxns)).map(([date, txns], groupIndex) => (
          <div key={groupIndex} style={{ padding: 8 }}>
            <Typography variant="body4" color="text.subTitle" sx={{ mt: 15, mb: 2 }}>
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
          </div>
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
          <Typography variant="h6" sx={(theme) => ({ color: theme.palette.text.primary })}>
            <Trans>No Transaction yet.</Trans>
          </Typography>
          {/*<Typography sx={{ mt: 1, mb: 4 }} variant="description" color="text.secondary">*/}
          {/*  <Trans>*/}
          {/*    We couldn&apos;t find any transactions related to your search. Try again with a*/}
          {/*    different asset name, or reset filters.*/}
          {/*  </Trans>*/}
          {/*</Typography>*/}
          {/*<Button*/}
          {/*  variant="outlined"*/}
          {/*  onClick={() => {*/}
          {/*    setSearchQuery('');*/}
          {/*    setFilterQuery([]);*/}
          {/*    setSearchResetKey((prevKey) => prevKey + 1); // Remount SearchInput component to clear search query*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Reset Filters*/}
          {/*</Button>*/}
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
          <Typography variant="h6" sx={(theme) => ({ color: theme.palette.text.primary, my: 24 })}>
            <Trans>No Transaction yet.</Trans>
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
