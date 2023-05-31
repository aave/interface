import { CheckIcon, DuplicateIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import ArrowOutward from '@mui/icons-material/ArrowOutward';
import { Box, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { CompactableTypography, CompactMode } from 'src/components/CompactableTypography';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';
import { Link } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';

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
  downToXSM: boolean;
}

function TransactionRowItem({ transaction, downToXSM }: TransactionHistoryItemProps) {
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
    <Box px={6}>
      <ListItem
        px={downToXSM ? 4 : 3}
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
            <DarkTooltip
              title={copyStatus ? <Trans>Copied</Trans> : <Trans>Copy</Trans>}
              placement="top"
            >
              <Box
                onClick={() => handleCopy(explorerLink)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  height: '22px',
                }}
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
                  }}
                >
                  {copyStatus ? <CheckIcon /> : <DuplicateIcon />}
                </SvgIcon>
              </Box>
            </DarkTooltip>
            <DarkTooltip placement="top" title={<Trans>View on block explorer</Trans>}>
              <Link
                href={explorerLink}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  height: '22px',
                }}
              >
                <SvgIcon
                  sx={{
                    fontSize: '14px',
                    color: downToSM ? 'text.muted' : 'text.secondary',
                  }}
                >
                  <ArrowOutward />
                </SvgIcon>
              </Link>
            </DarkTooltip>
          </Box>
        </ListColumn>
      </ListItem>
    </Box>
  );
}

export default TransactionRowItem;
