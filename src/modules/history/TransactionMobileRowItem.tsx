import { CheckIcon, DuplicateIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CompactableTypography, CompactMode } from 'src/components/CompactableTypography';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { ListItem } from 'src/components/lists/ListItem';
import { Link } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';

import { ActionDetails, ActionTextMap } from './actions/ActionDetails';
import { unixTimestampToFormattedTime } from './helpers';
import { ActionFields, TransactionHistoryItem } from './types';

function ActionTitle({ action }: { action: string }) {
  return (
    <Typography variant="subheader2" color="text.muted">
      <ActionTextMap action={action} />
    </Typography>
  );
}

interface TransactionHistoryItemProps {
  transaction: TransactionHistoryItem & ActionFields[keyof ActionFields];
}

function TransactionMobileRowItem({ transaction }: TransactionHistoryItemProps) {
  const [copyStatus, setCopyStatus] = useState(false);
  const [currentNetworkConfig] = useRootStore((state) => [state.currentNetworkConfig]);
  const theme = useTheme();

  const downToMD = useMediaQuery(theme.breakpoints.down('md'));
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCopy = async (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(true);
  };

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
              <ActionTitle action={transaction.action} />
              <Typography variant="caption" color="text.muted">
                {unixTimestampToFormattedTime({ unixTimestamp: transaction.timestamp })}
              </Typography>
            </Box>

            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <DarkTooltip
                title={copyStatus ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
                placement="top"
              >
                <Box
                  onClick={() => handleCopy(explorerLink)}
                  sx={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
                >
                  {!downToMD && (
                    <React.Fragment>
                      <Typography variant="caption" color="text.secondary" mr={1}>
                        <Trans>Tx hash</Trans>
                      </Typography>
                      <CompactableTypography
                        compactMode={CompactMode.MD}
                        variant="caption"
                        color="text.primary"
                      >
                        {transaction.txHash}
                      </CompactableTypography>
                    </React.Fragment>
                  )}
                  <SvgIcon
                    sx={{
                      m: 1,
                      fontSize: '14px',
                      color: copyStatus ? 'green' : downToSM ? 'text.muted' : 'text.secondary',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {copyStatus ? <CheckIcon /> : <DuplicateIcon />}
                  </SvgIcon>
                </Box>
              </DarkTooltip>
              <DarkTooltip placement="top" title={<Trans>View on block explorer</Trans>}>
                <Link href={explorerLink}>
                  <SvgIcon
                    sx={{
                      fontSize: '14px',
                      color: downToSM ? 'text.muted' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ArrowOutward />
                  </SvgIcon>
                </Link>
              </DarkTooltip>
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
