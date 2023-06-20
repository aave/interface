import { Trans } from '@lingui/macro';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { ActionDetails, ActionTextMap } from './actions/ActionDetails';
import { unixTimestampToFormattedTime } from './helpers';
import { ActionFields, TransactionHistoryItem } from './types';

function ActionTitle({ action }: { action: string }) {
  return (
    <Typography sx={{ width: '180px' }}>
      <ActionTextMap action={action} />
    </Typography>
  );
}

interface TransactionHistoryItemProps {
  transaction: TransactionHistoryItem & ActionFields[keyof ActionFields];
}

function TransactionRowItem({ transaction }: TransactionHistoryItemProps) {
  const [copyStatus, setCopyStatus] = useState(false);
  const { currentNetworkConfig, trackEvent } = useRootStore((state) => ({
    currentNetworkConfig: state.currentNetworkConfig,
    trackEvent: state.trackEvent,
  }));
  const theme = useTheme();

  const downToMD = useMediaQuery(theme.breakpoints.down('md'));

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

  const explorerLink = currentNetworkConfig.explorerLinkBuilder({ tx: transaction.txHash });

  return (
    <Box px={6}>
      <ListItem
        px={3}
        sx={{
          borderWidth: `1px 0 0 0`,
          borderStyle: `solid`,
          borderColor: `${theme.palette.divider}`,
          height: '72px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'left',
            gap: '4px',
            mr: 6,
          }}
        >
          <ActionTitle action={transaction.action} />
          <Typography variant="caption" color="text.muted">
            {unixTimestampToFormattedTime({ unixTimestamp: transaction.timestamp })}
          </Typography>
        </Box>

        <Box>
          <ActionDetails transaction={transaction} iconSize="20px" />
        </Box>
        <ListColumn align="right">
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            {!downToMD && (
              <Button
                variant="outlined"
                href={explorerLink}
                target="_blank"
                onClick={() =>
                  trackEvent(GENERAL.EXTERNAL_LINK, { funnel: 'TxHistoy', Link: 'Etherscan' })
                }
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
            )}
          </Box>
        </ListColumn>
      </ListItem>
    </Box>
  );
}

export default TransactionRowItem;
