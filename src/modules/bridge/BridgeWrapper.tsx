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

import { BridgeTransactionListItem } from './BridgeTransactionListItem';

export function BridgeWrapper() {
  const [user] = useRootStore((state) => [state.account]);

  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const { data: bridgeTransactions, isLoading: loadingBridgeTransactions } =
    useBridgeTransactionHistory(user);

  if (loadingBridgeTransactions) {
    return <div>loading...</div>; // TODO: skeleton
  }

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
          <Trans>You have not bridged any transactions</Trans>
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
      <ListHeaderWrapper px={downToXSM ? 4 : 6}>
        <ListColumn isRow maxWidth={280}>
          <ListHeaderTitle>
            <Trans>Asset</Trans>
          </ListHeaderTitle>
        </ListColumn>

        <ListColumn isRow maxWidth={280}>
          <ListHeaderTitle>
            <Trans>Source</Trans>
            <SvgIcon sx={{ fontSize: '13px', mx: 1 }}>
              <ArrowNarrowRightIcon />
            </SvgIcon>
            <Trans>Destination</Trans>
          </ListHeaderTitle>
        </ListColumn>

        <ListColumn isRow maxWidth={280}>
          <ListHeaderTitle>
            <Trans>Age</Trans>
          </ListHeaderTitle>
        </ListColumn>

        <ListColumn isRow maxWidth={280}>
          <ListHeaderTitle>
            <Trans>Status</Trans>
          </ListHeaderTitle>
        </ListColumn>

        <ListColumn maxWidth={95} minWidth={95} />
      </ListHeaderWrapper>

      {bridgeTransactions &&
        bridgeTransactions.length > 0 &&
        bridgeTransactions?.map((tx) => <BridgeTransactionListItem key={tx.id} transaction={tx} />)}
    </ListWrapper>
  );
}
