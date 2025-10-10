import { Trans } from '@lingui/macro';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, SvgIcon, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ListItem } from 'src/components/lists/ListItem';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { ActionDetails, ActionTextMap } from './actions/ActionDetails';
import { getExplorerLink, getTransactionAction, unixTimestampToFormattedTime } from './helpers';
import { TransactionHistoryItemUnion } from './types';

function ActionTitle({ action }: { action: string }) {
  return (
    <Typography variant="subheader2" color="text.muted">
      <ActionTextMap action={action} />
    </Typography>
  );
}

interface TransactionHistoryItemProps {
  transaction: TransactionHistoryItemUnion;
}

function TransactionMobileRowItem({ transaction }: TransactionHistoryItemProps) {
  const [copyStatus, setCopyStatus] = useState(false);
  const [currentNetworkConfig, trackEvent] = useRootStore(
    useShallow((state) => [state.currentNetworkConfig, state.trackEvent])
  );
  const theme = useTheme();
  const explorerLink = getExplorerLink(transaction, currentNetworkConfig);
  const action = getTransactionAction(transaction);
  const timestamp = Date.parse(transaction.timestamp);

  useEffect(() => {
    if (copyStatus) {
      const timer = setTimeout(() => {
        setCopyStatus(false);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [copyStatus]);

  return (
    <Box>
      <ListItem
        px={4}
        sx={{
          borderWidth: `1px 0 0 0`,
          borderStyle: `solid`,
          borderColor: `${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'left',
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              pt: '14px',
            }}
          >
            <Box sx={{ display: 'flex', gap: 2 }}>
              <ActionTitle action={action} />
            </Box>

            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              {' '}
              <Typography variant="caption" color="text.muted">
                {unixTimestampToFormattedTime({ unixTimestamp: timestamp })}
              </Typography>
              {explorerLink && (
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
                  href={explorerLink}
                  target="_blank"
                  onClick={() =>
                    trackEvent(GENERAL.EXTERNAL_LINK, { funnel: 'TxHistoy', Link: 'Etherscan' })
                  }
                >
                  <Trans>VIEW TX</Trans>{' '}
                  <SvgIcon
                    sx={{
                      fontSize: '15px',
                      pl: 1,
                      pb: 0.5,
                    }}
                  >
                    <ArrowOutward />
                  </SvgIcon>
                </Button>
              )}
            </Box>
          </Box>
          <Box sx={{ py: '28px' }}>
            <ActionDetails transaction={transaction} iconSize="24px" />
          </Box>
        </Box>
      </ListItem>
    </Box>
  );
}

export default TransactionMobileRowItem;
