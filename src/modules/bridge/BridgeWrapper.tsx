import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Paper, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { useBridgeTransactionHistory } from 'src/hooks/useBridgeTransactionHistory';
import { useRootStore } from 'src/store/root';

import LoveGhost from '/public/loveGhost.svg';

import { BridgeTransactionListItemWrapper } from './BridgeTransactionListItem';
import {
  TransactionListItemLoader,
  TransactionMobileListItemLoader,
} from './TransactionListItemLoader';

export function BridgeWrapper() {
  const [user] = useRootStore((state) => [state.account]);

  const theme = useTheme();
  const downToSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: bridgeTransactions, isLoading: loadingBridgeTransactions } =
    useBridgeTransactionHistory(user);

  if (!loadingBridgeTransactions && bridgeTransactions?.length === 0) {
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
        <Typography variant={'h3'}>
          <Trans>You don&apos;t have any bridge transactions</Trans>
        </Typography>{' '}
      </Paper>
    );
  }

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h2" sx={{ mr: 4 }}>
          <Trans>Bridge Transactions</Trans>
        </Typography>
      }
    >
      {!downToSm && (
        <ListHeaderWrapper>
          <ListColumn align="left">
            <ListHeaderTitle>
              <Trans>Asset</Trans>
            </ListHeaderTitle>
          </ListColumn>

          <ListColumn align="left">
            <ListHeaderTitle>
              <Trans>Source</Trans>
              <SvgIcon sx={{ fontSize: '13px', mx: 1 }}>
                <ArrowNarrowRightIcon />
              </SvgIcon>
              <Trans>Destination</Trans>
            </ListHeaderTitle>
          </ListColumn>

          <ListColumn align="left">
            <ListHeaderTitle>
              <Trans>Age</Trans>
            </ListHeaderTitle>
          </ListColumn>

          <ListColumn align="left">
            <ListHeaderTitle>
              <Trans>Status</Trans>
            </ListHeaderTitle>
          </ListColumn>

          <ListColumn maxWidth={95} minWidth={95} />
        </ListHeaderWrapper>
      )}

      {loadingBridgeTransactions &&
        (downToSm
          ? Array.from({ length: 5 }).map((_, i) => <TransactionMobileListItemLoader key={i} />)
          : Array.from({ length: 5 }).map((_, i) => <TransactionListItemLoader key={i} />))}

      {bridgeTransactions &&
        bridgeTransactions.length > 0 &&
        bridgeTransactions?.map((tx) => (
          <BridgeTransactionListItemWrapper key={tx.id} transaction={tx} />
        ))}
    </ListWrapper>
  );
}
