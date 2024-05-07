import { ArrowNarrowRightIcon, ExternalLinkIcon, XIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import {
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatUnits } from 'ethers/lib/utils';
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

dayjs.extend(relativeTime);

export const BridgeTransactionListItem = ({ transaction }: { transaction: Transaction }) => {
  const { offRamps, loading } = useGetOffRampForLane(
    transaction.sourceChainId,
    transaction.destinationChainId
  );

  const { data: executionState } = useGetExecutionState(
    transaction.destinationChainId,
    transaction.sequenceNumber,
    offRamps?.map((offRamp) => offRamp.offRamp)
  );

  if (loading) {
    return null; // TODO: skeleton
  }

  const { sourceChainId, destinationChainId, blockTimestamp, tokenAmounts } = transaction;

  // just assuming 1 token
  const amount = tokenAmounts[0].amount;
  const formattedAmount = formatUnits(amount, 18);

  return (
    <ListItem>
      <ListColumn isRow>
        <TokenIcon symbol="GHO" fontSize="large" />
        <Stack sx={{ ml: 2 }} direction="column" alignItems="center">
          <FormattedNumber
            sx={{ mb: 1 }}
            variant="secondary14"
            visibleDecimals={2}
            value={formattedAmount}
          />
          <FormattedNumber
            value={formattedAmount}
            symbol="USD"
            variant="secondary12"
            color="text.secondary"
          />
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
        <Typography variant="main14">{dayjs.unix(blockTimestamp).fromNow()}</Typography>
        <Typography variant="subheader2" color="text.muted">
          {dayjs.unix(blockTimestamp).format('MMMM D YYYY HH:mm [UTC]')}
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
          <IconButton
            LinkComponent={Link}
            href={`https://ccip.chain.link/tx/${transaction.transactionHash}`}
          >
            <SvgIcon sx={{ fontSize: '16px' }}>
              <ExternalLinkIcon />
            </SvgIcon>
          </IconButton>
        </DarkTooltip>
      </ListColumn>
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
