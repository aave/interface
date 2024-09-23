import { Trans } from '@lingui/macro';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, Button, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { SCAN_TRANSACTION_TON_HISTORY } from 'src/hooks/app-data-provider/useAppDataProviderTon';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { ActionDetails, ActionTextMap } from './actions/ActionDetails';
import { unixTimestampToFormattedTime } from './helpers';
import { ActionFields, TransactionHistoryItem } from './types';

function ActionTitle({ action }: { action: string }) {
  return (
    <Typography sx={{ width: '180px' }} variant="body8">
      <ActionTextMap action={action} />
    </Typography>
  );
}

interface TransactionHistoryItemProps {
  transaction: TransactionHistoryItem & ActionFields[keyof ActionFields];
}

function TransactionRowItem({ transaction }: TransactionHistoryItemProps) {
  const { isConnectedTonWallet } = useTonConnectContext();
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

  const explorerLink = isConnectedTonWallet
    ? `${SCAN_TRANSACTION_TON_HISTORY}/${transaction.txHash}`
    : currentNetworkConfig.explorerLinkBuilder({ tx: transaction.txHash });

  return (
    <Box px={0}>
      <ListItem
        px={3}
        sx={{
          borderTop: `1px solid ${theme.palette.border.divider}`,
          py: '18px',
          px: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'left',
            gap: 3,
            width: 220,
          }}
        >
          <ActionTitle action={transaction.action} />
          <Typography variant="body5" color="text.mainTitle">
            {unixTimestampToFormattedTime({ unixTimestamp: transaction.timestamp })}
          </Typography>
        </Box>

        <Box>
          <ActionDetails transaction={transaction} iconSize="24px" />
        </Box>
        <ListColumn align="right">
          {!downToMD && (
            <Button
              variant="text"
              size="small"
              sx={(theme) => ({
                px: 5,
                height: 34,
                color: theme.palette.text.secondary,
                fontSize: 17,
              })}
              href={explorerLink}
              target="_blank"
              onClick={() =>
                trackEvent(GENERAL.EXTERNAL_LINK, { funnel: 'TxHistoy', Link: 'Etherscan' })
              }
            >
              <Trans>Explorer</Trans>
              <ArrowOutward width={24} height={24} />
            </Button>
          )}
        </ListColumn>
      </ListItem>
    </Box>
  );
}

export default TransactionRowItem;
