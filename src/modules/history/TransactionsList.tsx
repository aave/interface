import { Trans } from '@lingui/macro';
import { Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import {
  FetchNextPageOptions,
  InfiniteData,
  InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import * as React from 'react';
import { useCallback, useRef } from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { Link } from 'src/components/primitives/Link';
import { TransactionHistoryItem } from 'src/hooks/useTransactionHistory';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';

import { FaucetItemLoader } from '../faucet/FaucetItemLoader';
import { FaucetMobileItemLoader } from '../faucet/FaucetMobileItemLoader';

export default function TransactionsAssetsList({
  transactions,
  loading,
  fetchNextPage,
}: {
  transactions?: InfiniteData<TransactionHistoryItem[]>;
  loading: boolean;
  fetchNextPage: (
    options?: FetchNextPageOptions | undefined
  ) => Promise<InfiniteQueryObserverResult<TransactionHistoryItem[], Error>>;
}) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      });
      if (node) observer.current.observe(node);
    },
    [fetchNextPage, loading]
  );
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const { currentNetworkConfig } = useRootStore();
  const { currentAccount, loading: web3Loading } = useWeb3Context();

  if (!currentAccount || loading) {
    return (
      <ConnectWalletPaper
        loading={web3Loading || loading}
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
      <ListHeaderWrapper px={downToXSM ? 4 : 6}>
        <ListColumn isRow>
          <ListHeaderTitle>
            <Trans>Link</Trans>
          </ListHeaderTitle>
        </ListColumn>

        <ListColumn isRow>
          <ListHeaderTitle>
            <Trans>Action</Trans>
          </ListHeaderTitle>
        </ListColumn>

        {/*         
Each action may have unique columns 
                <ListColumn>
                    <ListHeaderTitle>
                        <Trans>Amount</Trans>
                    </ListHeaderTitle>
                </ListColumn> */}
      </ListHeaderWrapper>

      {loading ? (
        downToXSM ? (
          <>
            <FaucetMobileItemLoader />
            <FaucetMobileItemLoader />
            <FaucetMobileItemLoader />
          </>
        ) : (
          <>
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
          </>
        )
      ) : transactions ? (
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
                      TX + PAGE INDEX {pageIndex} TX INDEX {index}
                    </Link>
                  </ListColumn>
                  <ListColumn>{transaction.action}</ListColumn>
                </ListItem>
              </div>
            );
          })
        )
      ) : (
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
          <Typography sx={{ mb: 6 }} color="text.secondary">
            <Trans>No transactions found for this user and market.</Trans>
          </Typography>
        </Paper>
      )}
    </ListWrapper>
  );
}
