import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { memo, ReactNode } from 'react';
import { ExternalLinkButton } from 'src/components/ExternalLinkButton';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { ActionDetails, ActionTextMap } from './actions/ActionDetails';
import { getExplorerLink, getTransactionAction, unixTimestampToFormattedTime } from './helpers';
import {
  HISTORY_ACTION_COLUMN,
  HISTORY_ACTIONS_COLUMN,
  HISTORY_DETAILS_COLUMN,
  HISTORY_ROW_MIN_HEIGHT,
  HISTORY_ROW_PX,
} from './HistoryListLayout';
import { getCancellableCowOrder, TransactionHistoryItemUnion } from './types';

interface TransactionRowItemProps {
  transaction: TransactionHistoryItemUnion;
  /** Below `HISTORY_CARDS_BELOW` the three columns stack into one. */
  stacked?: boolean;
  /** True in the width band where a Cancel button leaves no room for the status badge's label. */
  collapseStatusBadge?: boolean;
}

function TransactionRowItem({
  transaction,
  stacked,
  collapseStatusBadge,
}: TransactionRowItemProps) {
  const [currentNetworkConfig, trackEvent] = useRootStore(
    useShallow((state) => [state.currentNetworkConfig, state.trackEvent])
  );
  const { openCancelCowOrder } = useModalContext();

  const explorerLink = getExplorerLink(transaction, currentNetworkConfig);
  const action = getTransactionAction(transaction);
  const timestamp = Date.parse(transaction.timestamp);
  const cancellableOrder = getCancellableCowOrder(transaction);

  const title = (
    <Typography variant="subheader1" color="fg-1">
      <ActionTextMap action={action} />
    </Typography>
  );

  const time = (
    <Typography variant="caption" color="fg-3">
      {unixTimestampToFormattedTime({ unixTimestamp: timestamp })}
    </Typography>
  );

  const actions: ReactNode = (cancellableOrder || explorerLink) && (
    <>
      {cancellableOrder && (
        <Button
          variant="contained"
          size="small"
          onClick={() => openCancelCowOrder(cancellableOrder)}
        >
          <Trans>Cancel</Trans>
        </Button>
      )}
      {explorerLink && (
        <ExternalLinkButton
          href={explorerLink}
          onClick={() =>
            trackEvent(GENERAL.EXTERNAL_LINK, { funnel: 'TxHistoy', Link: 'Etherscan' })
          }
        >
          <Trans>View</Trans>
        </ExternalLinkButton>
      )}
    </>
  );

  if (stacked) {
    return (
      <ListItem sx={{ px: HISTORY_ROW_PX, py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', minWidth: 0 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}
          >
            {title}
            {time}
          </Box>

          <ActionDetails transaction={transaction} iconSize="24px" />

          {actions && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>{actions}</Box>
          )}
        </Box>
      </ListItem>
    );
  }

  return (
    <ListItem minHeight={HISTORY_ROW_MIN_HEIGHT} sx={{ px: HISTORY_ROW_PX }}>
      <ListColumn {...HISTORY_ACTION_COLUMN}>
        {title}
        {time}
      </ListColumn>

      <ListColumn {...HISTORY_DETAILS_COLUMN}>
        <ActionDetails
          transaction={transaction}
          iconSize="20px"
          showStatusBadgeAsIconOnly={!!cancellableOrder && collapseStatusBadge}
        />
      </ListColumn>

      <ListColumn {...HISTORY_ACTIONS_COLUMN}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>{actions}</Box>
      </ListColumn>
    </ListItem>
  );
}

// The list is not virtualised and every landing page re-renders the whole thing, so bail out on
// the rows already on screen — `transaction` references are stable across those re-renders.
export default memo(TransactionRowItem);
