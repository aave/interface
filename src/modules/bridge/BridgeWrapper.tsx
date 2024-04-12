import { Trans } from '@lingui/macro';
import { ArrowRightAltOutlined } from '@mui/icons-material';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Skeleton,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MessageDetails } from 'src/components/transactions/Bridge/BridgeActions';
import { SupportedNetworkWithChainId } from 'src/components/transactions/Bridge/common';
import offRampAbi from 'src/components/transactions/Bridge/OffRamp-abi.json';
// import onRampAbi from 'src/components/transactions/Bridge/OnRamp-abi.json';
import { getRouterConfig } from 'src/components/transactions/Bridge/Router';
import routerAbi from 'src/components/transactions/Bridge/Router-abi.json';
import { useRootStore } from 'src/store/root';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import LoveGhost from '/public/loveGhost.svg';

import { BridgeHistoryItemLoader } from '../bridge/BridgeHistoryItemLoader';

dayjs.extend(relativeTime);

// import { FaucetItemLoader } from './FaucetItemLoader';
// import { FaucetMobileItemLoader } from './FaucetMobileItemLoader';
interface BigNumberDetails {
  type: string;
  hex: string;
}
interface TransactionDetails {
  amount: string;
  token: string;
  destinationAccount: string;
  destinationChain: SupportedNetworkWithChainId;
  sourceChain: SupportedNetworkWithChainId;
  message: MessageDetails;
  fees: BigNumberDetails;
  txHash: string;
  messageId: string;
  gasPrice: BigNumberDetails;
  timestamp: number;
  messageStatus: string;
  sourceAccount: string;
}

// interface ExecutionStateChangedEventArgs {
//   messageId: string;
//   state: number;
// }

const messageExecutionState = {
  '0': 'UNTOUCHED',
  '1': 'IN_PROGRESS',
  '2': 'SUCCESS',
  '3': 'FAILURE',
};

const getMessageStatus = (status: bigint): string => {
  const statusKey = status.toString() as keyof typeof messageExecutionState;
  if (statusKey in messageExecutionState) {
    return messageExecutionState[statusKey];
  }
  return 'unknown';
};

export function BridgeWrapper() {
  const [isLoading, setIsLoading] = useState(true); // Add a loading state
  const [user] = useRootStore((state) => [state.account]);

  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const [statusLoading, setStatusLoading] = useState(false);

  // const [transactions, setTransactions] = useState([] as TransactionDetails[]);

  const [transactions, setTransactions] = useState<TransactionDetails[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedTransactions = localStorage.getItem('bridgedTransactions');
        if (storedTransactions) {
          const transactions: TransactionDetails[] = JSON.parse(storedTransactions);
          return transactions.filter((tx) => tx.sourceAccount === user);
        }
      }
    } catch (err) {
      console.error('Error loading transactions from localStorage:', err);
    }
    return [];
  });

  useEffect(() => {
    setIsLoading(true);

    try {
      const bridgedTransactions =
        typeof window !== 'undefined' ? localStorage.getItem('bridgedTransactions') : null;
      if (bridgedTransactions) {
        const filteredTransactions = JSON.parse(bridgedTransactions).filter(
          (tx: TransactionDetails) => tx.sourceAccount === user
        );

        setTransactions(filteredTransactions);
      }
    } catch (error) {
      console.error('Failed to parse transactions from localStorage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    console.log('Transactions State Updated:', transactions);
  }, [transactions]);

  useEffect(() => {
    setStatusLoading(true);
    setIsLoading(false);

    const fetchStatuses = async () => {
      const tempTransactions = await Promise.all(
        transactions.map(async (tx: TransactionDetails) => {
          try {
            const destinationRpcUrl = getProvider(tx.destinationChain.chainId);
            const sourceRpcUrl = getProvider(tx.sourceChain.chainId);

            const destinationRouterAddress = getRouterConfig(tx.destinationChain.chainId).address;
            const sourceRouterAddress = getRouterConfig(tx.sourceChain.chainId).address;

            if (
              !destinationRouterAddress ||
              !destinationRpcUrl ||
              !sourceRouterAddress ||
              !sourceRpcUrl ||
              !tx.messageId
            ) {
              throw new Error('Required information for transaction fetching is missing.');
            }

            const destinationRouterContract = new Contract(
              destinationRouterAddress,
              routerAbi,
              destinationRpcUrl
            );

            const offRamps = await destinationRouterContract.getOffRamps();

            for (const offRamp of offRamps) {
              if (
                offRamp.sourceChainSelector.toString() ===
                getRouterConfig(tx.sourceChain.chainId).chainSelector.toString()
              ) {
                const offRampContract = new Contract(
                  offRamp.offRamp,
                  offRampAbi,
                  destinationRpcUrl
                );

                const executionStateChangeEvent = offRampContract.filters.ExecutionStateChanged(
                  undefined,
                  tx.messageId,
                  undefined,
                  undefined
                );
                const events = await offRampContract.queryFilter(executionStateChangeEvent);

                for (const event of events) {
                  if (event.args && event.args.messageId === tx.messageId) {
                    const state = event.args.state;
                    const status = getMessageStatus(state);
                    console.log(`✅Status of message ${tx.messageId} is ${status}`);

                    return { ...tx, messageStatus: status }; // Prepare the updated transaction
                  }
                }
              }
            }
            // const sourceRouterContract = new Contract(sourceRouterAddress, routerAbi, sourceRpcUrl);

            // try {
            //   const onRampContractAddress = await sourceRouterContract.getOnRamp(
            //     getRouterConfig(tx.destinationChain.chainId).chainSelector.toString()
            //   );
            //   console.log(
            //     'onRampContractAddress -------------------------------',
            //     onRampContractAddress
            //   );
            //   const result = await sourceRpcUrl.send('eth_getLogs', [
            //     {
            //       address: [onRampContractAddress],
            //       fromBlock: '0x54cc28',
            //       toBlock: 'latest',
            //       topics: ['0xd0c3c799bf9e2639de44391e7f524d229b2b55f5b1ea94b2bf7da42f7243dddd'], // ccip send
            //     },
            //   ]);

            //   console.log('Result: ---->', result);
            // } catch (err) {
            //   console.error('something broke here', err);
            // }
          } catch (error) {
            return { ...tx, messageStatus: 'unknown' };
          }
          return tx;
        })
      );

      setTransactions(tempTransactions);
      setStatusLoading(false);
    };

    fetchStatuses();
  }, [transactions.length]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (transactions.length === 0 && !statusLoading) {
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

        <ListColumn maxWidth={280}>
          <ListHeaderTitle>
            <Trans>Explorer</Trans>
          </ListHeaderTitle>
        </ListColumn>
      </ListHeaderWrapper>

      {statusLoading ? (
        <>
          <BridgeHistoryItemLoader />
          <BridgeHistoryItemLoader />
          <BridgeHistoryItemLoader />
          <BridgeHistoryItemLoader />
          <BridgeHistoryItemLoader />
        </>
      ) : (
        transactions &&
        transactions.length > 0 &&
        transactions
          .slice()
          .reverse()
          .map((tx: TransactionDetails) => (
            <ListItem px={downToXSM ? 4 : 6} key={tx.txHash}>
              <ListColumn isRow maxWidth={280}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'left',
                    gap: '4px',
                    mr: 18,
                  }}
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <TokenIcon symbol={'GHO'} fontSize="medium" />
                    <FormattedNumber
                      visibleDecimals={2}
                      value={formatUnits(tx.amount, 18)}
                      variant={downToXSM ? 'main14' : 'main16'}
                    />
                  </Box>
                </Box>
              </ListColumn>

              <ListColumn align="left">
                <Box display="flex" alignItems="center" gap={downToXSM ? 0 : 2}>
                  <MarketLogo size={24} logo={tx.sourceChain.networkLogoPath} />
                  {!downToXSM && (
                    <SvgIcon
                      sx={{
                        marginLeft: '5px',
                        marginRight: '10px',
                        fontSize: '20px',
                        color: 'text.secondary',
                      }}
                    >
                      <ArrowRightAltOutlined />
                    </SvgIcon>
                  )}
                  <MarketLogo size={24} logo={tx.destinationChain.networkLogoPath} />
                </Box>
              </ListColumn>
              <ListColumn align="left">
                <Typography variant={downToXSM ? 'main12' : 'main14'}>
                  {dayjs.unix(tx.timestamp).fromNow()}
                </Typography>
                {!downToXSM && (
                  <Typography variant="subheader2" color="text.muted">
                    {dayjs.unix(tx.timestamp).format('MM.DD.YYYY HH:mm UTC')}
                  </Typography>
                )}
              </ListColumn>

              <ListColumn align="left">
                {tx.messageStatus ? (
                  <Typography
                    variant={downToXSM ? 'subheader2' : 'h4'}
                    style={{
                      color:
                        tx.messageStatus.toLowerCase() === 'success'
                          ? theme.palette.success.main
                          : tx.messageStatus.toLowerCase() === 'failed'
                          ? 'red'
                          : theme.palette.error.main,
                    }}
                  >
                    {tx.messageStatus.charAt(0).toUpperCase() +
                      tx.messageStatus.slice(1).toLowerCase()}
                  </Typography>
                ) : statusLoading ? (
                  <Skeleton width={80} height={20} />
                ) : (
                  <Typography
                    variant={downToXSM ? 'subheader2' : 'h4'}
                    style={{ color: theme.palette.warning.main }}
                  >
                    <Trans>Processing...</Trans>
                  </Typography>
                )}
              </ListColumn>

              <ListColumn maxWidth={280} align="center">
                <Button
                  variant="outlined"
                  href={`https://ccip.chain.link/tx/${tx.txHash}`}
                  target="_blank"
                  size={downToXSM ? 'small' : 'medium'}
                >
                  <Trans>View</Trans>{' '}
                  <SvgIcon
                    sx={{
                      marginLeft: '5px',
                      fontSize: '20px',
                      color: 'text.secondary',
                    }}
                  >
                    <ArrowOutward />
                  </SvgIcon>
                </Button>
              </ListColumn>
            </ListItem>
          ))
      )}
    </ListWrapper>
  );
}
