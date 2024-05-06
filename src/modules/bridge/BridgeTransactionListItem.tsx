import { Trans } from '@lingui/macro';
import { Button, Skeleton, Typography } from '@mui/material';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatUnits } from 'ethers/lib/utils';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { MarketLogo } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { BridgeTransaction as Transaction } from 'src/hooks/useBridgeTransactionHistory';
import {
  MessageExecutionState,
  useGetExecutionState,
  useGetOffRampForLane,
} from 'src/hooks/useBridgeTransactionStatus';
import { networkConfigs } from 'src/ui-config/networksConfig';

dayjs.extend(relativeTime);

const getExecutionStateText = (state: MessageExecutionState) => {
  switch (state) {
    case MessageExecutionState.UNTOUCHED:
      return 'Processing';
    case MessageExecutionState.IN_PROGRESS:
      return 'In Progress';
    case MessageExecutionState.SUCCESS:
      return 'Success';
    case MessageExecutionState.FAILURE:
      return 'Failure';
  }
};

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
    return null;
  }

  const { sourceChainId, destinationChainId, blockTimestamp, tokenAmounts } = transaction;

  // just assuming 1 token
  const amount = tokenAmounts[0].amount;

  return (
    <ListItem>
      <ListColumn isRow>
        <TokenIcon symbol="GHO" fontSize="large" />
        <Typography variant="subheader1" sx={{ ml: 3 }} noWrap>
          GHO
        </Typography>
      </ListColumn>
      <ListColumn align="left">
        <MarketLogo size={28} logo={networkConfigs[sourceChainId].networkLogoPath} />
      </ListColumn>
      <ListColumn align="left">
        <MarketLogo size={28} logo={networkConfigs[destinationChainId].networkLogoPath} />
      </ListColumn>
      <ListColumn align="left">
        <Typography color="text.secondary" variant="main16">
          {dayjs.unix(blockTimestamp).fromNow()}
        </Typography>
      </ListColumn>
      <ListColumn align="left">
        <FormattedNumber
          visibleDecimals={2}
          symbol={'USD'}
          value={formatUnits(amount, 18)}
          variant="main16"
        />
      </ListColumn>
      <ListColumn align="left">
        {!executionState ? (
          <Skeleton width={40} height={100} />
        ) : (
          <Typography variant="main16">{getExecutionStateText(executionState)}</Typography>
        )}
      </ListColumn>
      <ListColumn maxWidth={280} align="right">
        <Button
          component="a"
          target="_blank"
          href={`https://ccip.chain.link/tx/${transaction.transactionHash}`}
          variant="contained"
        >
          <Trans>View Transaction</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};
