import { ChainId } from '@aave/contract-helpers';
import { ArrowNarrowRightIcon, ExternalLinkIcon, XIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { MessageExecutionState } from 'src/components/transactions/Bridge/BridgeConfig';
import { BridgeTransaction as Transaction } from 'src/hooks/useBridgeTransactionHistory';
import { useGetExecutionState, useGetOffRampForLane } from 'src/hooks/useBridgeTransactionStatus';
import { networkConfigs } from 'src/ui-config/networksConfig';

import {
  TransactionListItemLoader,
  TransactionMobileListItemLoader,
} from './TransactionListItemLoader';

dayjs.extend(relativeTime);

export const BridgeTransactionListItemWrapper = ({ transaction }: { transaction: Transaction }) => {
  const theme = useTheme();
  const downToSm = useMediaQuery(theme.breakpoints.down('sm'));
  const [, setTime] = useState(dayjs());

  useEffect(() => {
    // Update every minute so the 'age' field updates while viewing the page
    const intervalId = setInterval(() => {
      setTime(dayjs());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const { offRamps, loading } = useGetOffRampForLane(
    transaction.sourceChainId,
    transaction.destinationChainId
  );

  const { data: executionState } = useGetExecutionState(
    transaction.destinationChainId,
    transaction.sequenceNumber,
    offRamps?.map((offRamp) => offRamp.offRamp)
  );

  const props: ListItemProps = {
    sourceChainId: transaction.sourceChainId,
    destinationChainId: transaction.destinationChainId,
    age: dayjs.unix(transaction.blockTimestamp).fromNow(),
    blockTimestamp: transaction.blockTimestamp,
    amount: formatUnits(transaction.tokenAmounts[0].amount, 18), // assuming only 1 token transferred
    executionState,
    txHash: transaction.transactionHash,
  };

  if (downToSm) {
    if (loading) {
      return <TransactionMobileListItemLoader />;
    } else {
      return <BridgeTransactionMobileListItem {...props} />;
    }
  } else {
    if (loading) {
      return <TransactionListItemLoader />;
    } else {
      return <BridgeTransactionListItem {...props} />;
    }
  }
};

type ListItemProps = {
  sourceChainId: ChainId;
  destinationChainId: ChainId;
  age: string;
  blockTimestamp: number;
  amount: string;
  executionState: MessageExecutionState | undefined;
  txHash: string;
};

export const BridgeTransactionListItem = ({
  sourceChainId,
  destinationChainId,
  age,
  blockTimestamp,
  amount,
  executionState,
  txHash,
}: ListItemProps) => {
  return (
    <ListItem>
      <ListColumn isRow>
        <TokenIcon symbol="GHO" fontSize="large" />
        <Stack sx={{ ml: 2 }} direction="column" alignItems="center">
          <FormattedNumber
            sx={{ mb: 1 }}
            variant="secondary14"
            visibleDecimals={2}
            value={amount}
          />
          {/* <FormattedNumber
            value={amount}
            symbol="USD"
            variant="secondary12"
            color="text.secondary"
          /> */}
        </Stack>
      </ListColumn>
      <ListColumn align="left">
        <Stack direction="row" gap={3} alignItems="center">
          <MarketLogo
            sx={{ mr: 0 }}
            size={28}
            logo={networkConfigs[sourceChainId].networkLogoPath}
          />
          <SvgIcon sx={{ fontSize: '13px' }}>
            <ArrowNarrowRightIcon />
          </SvgIcon>
          <MarketLogo size={28} logo={networkConfigs[destinationChainId].networkLogoPath} />
        </Stack>
      </ListColumn>
      <ListColumn align="left">
        <Typography variant="main14">{age}</Typography>
        <Typography variant="subheader2" color="text.muted">
          {dayjs.unix(blockTimestamp).format('MMMM D YYYY h:mm A')}
        </Typography>
      </ListColumn>
      <ListColumn align="left">
        {executionState === undefined ? (
          <Skeleton width={90} height={35} />
        ) : (
          <TxStatus state={executionState} />
        )}
      </ListColumn>
      <ListColumn maxWidth={95} minWidth={95} align="left">
        <DarkTooltip title="View in explorer" sx={{ display: { xsm: 'none' } }}>
          <IconButton LinkComponent={Link} href={`https://ccip.chain.link/tx/${txHash}`}>
            <SvgIcon sx={{ fontSize: '16px' }}>
              <ExternalLinkIcon />
            </SvgIcon>
          </IconButton>
        </DarkTooltip>
      </ListColumn>
    </ListItem>
  );
};

const BridgeTransactionMobileListItem = ({
  sourceChainId,
  destinationChainId,
  age,
  blockTimestamp,
  amount,
  executionState,
  txHash,
}: ListItemProps) => {
  return (
    <ListItem>
      <Stack direction="row" my={4} justifyContent="space-between" sx={{ width: '100%' }}>
        <Stack direction="column" gap={2}>
          <Stack>
            <Typography variant="main14">{age}</Typography>
            <Typography variant="subheader2" color="text.muted">
              {dayjs.unix(blockTimestamp).format('MMMM D YYYY h:mm A')}
            </Typography>
          </Stack>
          <Stack direction="row">
            <TokenIcon symbol="GHO" sx={{ fontSize: '40px' }} />
            <Stack sx={{ ml: 2 }} direction="column" alignItems="center" justifyContent="center">
              <FormattedNumber
                sx={{ mb: 1 }}
                variant="secondary14"
                visibleDecimals={2}
                value={amount}
              />
              {/* <FormattedNumber
                value={amount}
                symbol="USD"
                variant="secondary12"
                color="text.secondary"
              /> */}
            </Stack>
          </Stack>
        </Stack>
        <Stack justifyContent="center">
          <Stack direction="column" gap={3} alignItems="center">
            <Stack direction="row">
              {executionState === undefined ? (
                <Skeleton width={90} height={35} />
              ) : (
                <TxStatus state={executionState} />
              )}
              <Button
                sx={{
                  display: 'flex',
                  ml: 3,
                  mr: 1,
                  width: '69px',
                  height: '20px',
                  fontSize: '0.6rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pl: 1,
                  pr: 1,
                }}
                variant="outlined"
                href={`https://ccip.chain.link/tx/${txHash}`}
                target="_blank"
              >
                <Trans>View TX</Trans>{' '}
                <SvgIcon
                  sx={{
                    fontSize: '15px',
                    pl: 1,
                    pb: 0.5,
                  }}
                >
                  <ExternalLinkIcon />
                </SvgIcon>
              </Button>
            </Stack>
            <Stack direction="row" gap={3} alignItems="center">
              <MarketLogo
                sx={{ mr: 0 }}
                size={28}
                logo={networkConfigs[sourceChainId].networkLogoPath}
              />
              <SvgIcon sx={{ fontSize: '13px' }}>
                <ArrowNarrowRightIcon />
              </SvgIcon>
              <MarketLogo size={28} logo={networkConfigs[destinationChainId].networkLogoPath} />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </ListItem>
  );
};

const TxStatus = ({ state }: { state: MessageExecutionState }) => {
  const { palette } = useTheme();

  switch (state) {
    case MessageExecutionState.UNTOUCHED:
    case MessageExecutionState.IN_PROGRESS:
      return (
        <Stack direction="row" gap={2} alignItems="center">
          <CircularProgress size="12px" />
          <Typography color={palette.text.muted} variant="main14">
            Processing
          </Typography>
        </Stack>
      );
    case MessageExecutionState.SUCCESS:
      return (
        <Stack direction="row" gap={2} alignItems="center">
          <Box
            sx={{
              width: '20px',
              height: '20px',
              bgcolor: 'success.200',
              borderRadius: '50%',
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SvgIcon sx={{ color: 'success.main', fontSize: '16px' }}>
              <CheckIcon />
            </SvgIcon>
          </Box>
          <Typography color={palette.success.main} variant="main14">
            Success
          </Typography>
        </Stack>
      );
    case MessageExecutionState.FAILURE:
      return (
        <Stack direction="row" gap={2} alignItems="center">
          <Box
            sx={{
              width: '20px',
              height: '20px',
              backgroundColor: 'error.200',
              borderRadius: '50%',
              mx: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SvgIcon sx={{ color: 'error.main', fontSize: '16px' }}>
              <XIcon />
            </SvgIcon>
          </Box>
          <Typography color={palette.error.main} variant="main14">
            Failed
          </Typography>
        </Stack>
      );
    default:
      return null;
  }
};
