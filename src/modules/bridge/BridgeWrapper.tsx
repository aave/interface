import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Contract } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListItem } from 'src/components/lists/ListItem';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MessageDetails } from 'src/components/transactions/Bridge/BridgeActions';
import { SupportedNetworkWithChainId } from 'src/components/transactions/Bridge/common';
import offRampAbi from 'src/components/transactions/Bridge/OffRamp-abi.json';
// import onRampAbi from 'src/components/transactions/Bridge/OnRamp-abi.json';
import { getRouterConfig } from 'src/components/transactions/Bridge/Router';
import routerAbi from 'src/components/transactions/Bridge/Router-abi.json';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

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
  console.log('Status: --->', status);

  const statusKey = status.toString() as keyof typeof messageExecutionState;
  if (statusKey in messageExecutionState) {
    return messageExecutionState[statusKey];
  }
  return 'unknown';
};

export function BridgeWrapper() {
  const [transactions, setTransactions] = useState<TransactionDetails[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);

  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const bridgedTransactions =
    typeof window !== 'undefined' && localStorage.getItem('bridgedTransactions');

  useEffect(() => {
    console.log('Transactions State Updated:', transactions);
  }, [transactions]);

  useEffect(() => {
    console.log('Before loading from localStorage', transactions);

    const loadTransactions = () => {
      if (bridgedTransactions) {
        const parsedBridgeTx = JSON.parse(bridgedTransactions);
        setTransactions(parsedBridgeTx);
      }
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    setStatusLoading(true);

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
            console.error(`Error fetching status for transaction ${tx.messageId}:`, error);
          }
          return tx;
        })
      );

      setTransactions(tempTransactions);
      setStatusLoading(false);
    };

    fetchStatuses();
  }, [transactions.length]);

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
            <Trans>Source Tx</Trans>
          </ListHeaderTitle>
        </ListColumn>

        <ListColumn isRow maxWidth={280}>
          <ListHeaderTitle>
            <Trans>Destination Tx</Trans>
          </ListHeaderTitle>
        </ListColumn>

        <ListColumn isRow maxWidth={280}>
          <ListHeaderTitle>
            <Trans>Age</Trans>
          </ListHeaderTitle>
        </ListColumn>

        {!downToXSM && (
          <ListColumn isRow>
            <ListHeaderTitle>
              <Trans>Amount</Trans>
            </ListHeaderTitle>
          </ListColumn>
        )}

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

      {false ? (
        downToXSM ? (
          <>
            {/* <FaucetMobileItemLoader />
            <FaucetMobileItemLoader />
            <FaucetMobileItemLoader /> */}
          </>
        ) : (
          <>
            {/* <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader />
            <FaucetItemLoader /> */}
          </>
        )
      ) : (
        transactions &&
        transactions.length > 0 &&
        transactions.map((tx: TransactionDetails) => (
          <ListItem
            px={downToXSM ? 4 : 6}
            key={tx.txHash}
            // data-cy={`faucetListItem_${reserve.symbol.toUpperCase()}`}
          >
            <ListColumn isRow maxWidth={280}>
              <Link
                href={'https://arbiscan.io/tx/' + tx.txHash}
                // href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
                noWrap
                sx={{ display: 'inline-flex', alignItems: 'center' }}
              >
                <TokenIcon symbol={'GHO'} fontSize="large" />
                <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
                  <Typography variant="h4" noWrap>
                    GHO
                  </Typography>
                  <Typography variant="subheader2" color="text.muted" noWrap>
                    GHO
                  </Typography>
                </Box>
              </Link>
            </ListColumn>

            <ListColumn align="left">
              <MarketLogo size={28} logo={tx.sourceChain.networkLogoPath} />
            </ListColumn>
            <ListColumn align="left">
              <MarketLogo size={28} logo={tx.destinationChain.networkLogoPath} />
            </ListColumn>
            <ListColumn align="left">
              <Typography color="text.secondary" variant="main16">
                {dayjs.unix(tx.timestamp).fromNow()}
              </Typography>
            </ListColumn>

            {!downToXSM && (
              <ListColumn align="left">
                <FormattedNumber
                  visibleDecimals={2}
                  symbol={'USD'}
                  value={formatUnits(tx.amount, 18)}
                  variant="main16"
                />
              </ListColumn>
            )}

            {tx.messageStatus ? (
              <ListColumn align="left">
                <Typography variant="main16">{tx.messageStatus}</Typography>
              </ListColumn>
            ) : statusLoading ? (
              <ListColumn align="left">
                <Skeleton width={40} height={40} />
              </ListColumn>
            ) : (
              <ListColumn align="left">
                <Typography variant="main16">
                  <Trans>Processing...</Trans>
                </Typography>
              </ListColumn>
            )}

            <ListColumn maxWidth={280} align="right">
              <Button
                component="a"
                target="_blank"
                href={`https://ccip.chain.link/tx/${tx.txHash}`}
                variant="contained"
              >
                <Trans>View Transaction</Trans>
              </Button>
            </ListColumn>
          </ListItem>
        ))
      )}
    </ListWrapper>
  );
}
