import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Paper, useMediaQuery, useTheme } from '@mui/material';
import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { CONTENT_TOP_PADDING } from 'src/components/ContentContainer';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { SearchInput } from 'src/components/SearchInput';
import { applyTxHistoryFilters, useTransactionHistory } from 'src/hooks/useTransactionHistory';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { groupByDate } from './helpers';
import { HistoryExportMenu } from './HistoryExportMenu';
import { HistoryFilterMenu } from './HistoryFilterMenu';
import { HistoryItemLoader } from './HistoryItemLoader';
import { HISTORY_CARDS_BELOW, HistoryDateHeading } from './HistoryListLayout';
import TransactionRowItem from './TransactionRowItem';
import { FilterOptions } from './types';

export const HistoryWrapper = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState<FilterOptions[]>([]);
  const [searchResetKey, setSearchResetKey] = useState(0);

  const isFilterActive = searchQuery.length > 0 || filterQuery.length > 0;
  const currentMarket = useRootStore((store) => store.currentMarket);
  const { currentAccount } = useWeb3Context();

  const theme = useTheme();
  const stackRows = useMediaQuery(theme.breakpoints.down(HISTORY_CARDS_BELOW));

  const {
    data: transactions,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
    fetchForDownload,
  } = useTransactionHistory({ isFilterActive });

  // Sentinel under the last row: pull the next page once it scrolls into view.
  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useCallback(
    (node: HTMLDivElement | null) => {
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
  const dateGroups = useMemo(() => groupByDate(filteredTxns), [filteredTxns]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterQuery([]);
    setSearchResetKey((prevKey) => prevKey + 1); // Remount SearchInput to clear its search query
  };

  if (!currentAccount) {
    return (
      <ConnectWalletPaper
        description={<Trans>Please connect your wallet to view transaction history.</Trans>}
      />
    );
  }

  const isEmpty = filteredTxns.length === 0;

  // Four sibling states rather than a ternary tree, so the list branch can stay long without
  // burying the three short ones.
  const renderBody = () => {
    if (isLoading) {
      return (
        <>
          <HistoryItemLoader stacked={stackRows} />
          <HistoryItemLoader stacked={stackRows} />
        </>
      );
    }

    if (isEmpty && isFilterActive) {
      return (
        <NoSearchResults
          searchTerm={searchQuery}
          subtitle={
            <Trans>
              We couldn&apos;t find any transactions related to your search. Try again with a
              different asset name, or reset filters.
            </Trans>
          }
        >
          <Button variant="tertiary" onClick={resetFilters}>
            <Trans>Reset filters</Trans>
          </Button>
        </NoSearchResults>
      );
    }

    if (isEmpty) {
      return (
        <NoSearchResults
          title={<Trans>No transactions yet</Trans>}
          subtitle={
            currentMarket === 'proto_plasma_v3' ? (
              <Trans>Transaction history for Plasma is not supported yet, coming soon.</Trans>
            ) : (
              <Trans>Your supplies, borrows and swaps on this market will show up here.</Trans>
            )
          }
        />
      );
    }

    // One flat run of date headings and rows, so a row's hairline comes from ListItem's own
    // `:not(:last-child)` rule and the last row in the card goes without one.
    return (
      <Box>
        {dateGroups.map(({ date, rows }) => (
          <Fragment key={date}>
            <HistoryDateHeading>{date}</HistoryDateHeading>
            {rows.map(({ id, transaction }) => (
              <TransactionRowItem key={id} transaction={transaction} stacked={stackRows} />
            ))}
          </Fragment>
        ))}
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: CONTENT_TOP_PADDING }}>
      {/* Same shape as the markets / staking filter bars (AssetsFilterBar): search on the left,
          the dropdowns on the right, each full width once they stack. */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', xsm: 'row' },
          alignItems: { xs: 'stretch', xsm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: '0.75rem', xsm: '0.5rem' },
        }}
      >
        <SearchInput
          key={searchResetKey}
          onSearchTermChange={setSearchQuery}
          placeholder="Search assets"
          wrapperSx={{ width: { xs: '100%', xsm: '340px' } }}
        />

        {/* On their own line the two dropdowns take opposite ends; once the row is sized to its
            content space-between is inert and the gap sets them apart. */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            width: { xs: '100%', xsm: 'auto' },
          }}
        >
          <HistoryFilterMenu onFilterChange={setFilterQuery} currentFilter={filterQuery} />
          <HistoryExportMenu
            fetchForDownload={fetchForDownload}
            filters={{ searchQuery, filterQuery }}
          />
        </Box>
      </Box>

      {/* Clipped, because a date heading carries the band's own surface: as a square-cornered
          child it would otherwise paint over the card's rounded corners. The neighbouring tables
          round each such child individually instead, which only works while the child is a direct
          child of the Paper — here the rows sit one level down, inside their own wrapper. */}
      <Paper variant="table" sx={{ overflow: 'hidden' }}>
        {renderBody()}

        {!isEmpty && <Box ref={loadMoreRef} sx={{ height: '1px' }} />}

        {isFetchingNextPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={20} sx={{ color: 'fg-3' }} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default HistoryWrapper;
