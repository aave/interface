import { DownloadIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import SortIcon from '@mui/icons-material/Sort';
import {
  Box,
  Button,
  CircularProgress,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { ReactElement, useCallback, useRef, useState } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { Link } from 'src/components/primitives/Link';
import { TransactionHistoryItem, useTransactionHistory } from 'src/hooks/useTransactionHistory';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { HistoryItemLoader } from './HistoryItemLoader';
import { HistoryMobileItemLoader } from './HistoryMobileItemLoader';
import SearchBox from './HistorySearchBox';

enum FilterOptions {
  ALL,
  SUPPLY,
  BORROW,
}

const FilterLabel = ({ filter }: { filter: FilterOptions }): ReactElement => {
  switch (filter) {
    case FilterOptions.ALL:
      return <Trans>All transactions</Trans>;
    case FilterOptions.SUPPLY:
      return <Trans>Supply</Trans>;
    case FilterOptions.BORROW:
      return <Trans>Borrow</Trans>;
    default:
      return <></>;
  }
};

const downloadFile = () => {
  const content = 'oh hi there';
  const fileName = 'hi.txt';
  const file = new Blob([content], { type: 'text/plain' });
  const downloadUrl = URL.createObjectURL(file);

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(downloadUrl);
};

function HistoryWrapper() {
  const {
    data: transactions,
    isLoading,
    fetchNextPage,
    isFetchingNextPage,
  } = useTransactionHistory();

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
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const { currentNetworkConfig } = useRootStore();
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const [filter] = useState<FilterOptions>(FilterOptions.ALL);

  if (!currentAccount) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans> Please connect your wallet to view transaction history.</Trans>}
      />
    );
  }

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
          <Button
            sx={{
              width: 170,
              background: 'white',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 2,
              height: 36,
              border: '1px solid #EAEBEF',
              borderRadius: '4px',
            }}
          >
            <SvgIcon height={10} width={10} color="primary">
              <SortIcon />
            </SvgIcon>
            <Typography variant="subheader1" color="text.primary" sx={{ ml: 2 }}>
              <FilterLabel filter={filter} />
            </Typography>
          </Button>
          <SearchBox />
        </Box>
        <Box
          sx={{ display: 'flex', alignItems: 'center', height: 36, gap: 0.5, cursor: 'pointer' }}
          onClick={() => downloadFile()}
        >
          <SvgIcon width={8} height={8}>
            <DownloadIcon />
          </SvgIcon>
          <Typography variant="buttonM" color="text.primary">
            {downToMD ? <Trans>.CSV</Trans> : <Trans>Download .CSV</Trans>}
          </Typography>
        </Box>
      </Box>

      {isLoading ? (
        downToXSM ? (
          <>
            <HistoryMobileItemLoader />
            <HistoryMobileItemLoader />
          </>
        ) : (
          <>
            <HistoryItemLoader />
            <HistoryItemLoader />
          </>
        )
      ) : transactions && transactions.pages && transactions.pages[0].length > 0 ? (
        transactions.pages.map((page: TransactionHistoryItem[], pageIndex: number) =>
          page.map((transaction: TransactionHistoryItem, index: number) => {
            const isLastItem =
              pageIndex === transactions.pages.length - 1 && index === page.length - 1;

            return (
              <div ref={isLastItem ? lastElementRef : null} key={index}>
                <ListItem px={downToXSM ? 4 : 6}>
                  <ListColumn>
                    <Link
                      href={currentNetworkConfig.explorerLinkBuilder({ tx: transaction.txHash })}
                    >
                      TX
                    </Link>
                  </ListColumn>
                  <ListColumn>{transaction.action}</ListColumn>
                </ListItem>
              </div>
            );
          })
        )
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
}

export default HistoryWrapper;
