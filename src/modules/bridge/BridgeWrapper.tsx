import { ArrowNarrowRightIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Button, Paper, Stack, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { Link } from 'src/components/primitives/Link';
import { useBridgeTransactionHistory } from 'src/hooks/useBridgeTransactionHistory';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import LandingGhost from '/public/resting-gho-hat-purple.svg';

import { BridgeTransactionListItemWrapper } from './BridgeTransactionListItem';
import {
  TransactionListItemLoader,
  TransactionMobileListItemLoader,
} from './TransactionListItemLoader';

export function BridgeWrapper() {
  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { openBridge } = useModalContext();

  const theme = useTheme();
  const downToSm = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: bridgeTransactions, isLoading: loadingBridgeTransactions } =
    useBridgeTransactionHistory(currentAccount);

  if (!currentAccount) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans> Please connect your wallet to view transaction history.</Trans>}
      />
    );
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
        <LandingGhost style={{ marginBottom: '16px' }} />
        <Typography variant={'h3'}>
          <Trans>You don&apos;t have any bridge transactions</Trans>
        </Typography>{' '}
        <Button sx={{ mt: 4 }} onClick={openBridge} variant="gradient">
          <Typography typography="subheader1">Bridge GHO</Typography>
        </Button>
      </Paper>
    );
  }

  return (
    <ListWrapper
      titleComponent={
        <Stack
          sx={{ width: '100%' }}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography component="div" variant="h2" sx={{ mr: 4 }}>
            <Trans>Recent Transactions</Trans>
          </Typography>
          <Link underline="none" href={`https://ccip.chain.link/address/${currentAccount}`}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Typography variant="caption">
                <Trans>View all</Trans>
              </Typography>
              <SvgIcon sx={{ fontSize: '16px' }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Stack>
          </Link>
        </Stack>
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
