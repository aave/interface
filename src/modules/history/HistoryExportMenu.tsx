import { Trans } from '@lingui/macro';
import { Button, CircularProgress, ListItemText, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import { ChevronUpDownIcon } from 'src/components/icons/ChevronUpDownIcon';
import { useRootStore } from 'src/store/root';
import { TRANSACTION_HISTORY } from 'src/utils/events';

import { downloadData, formatTransactionData, toCsv } from './helpers';
import { HistoryFilters, TransactionHistoryItemUnion } from './types';

interface HistoryExportMenuProps {
  fetchForDownload: (filters: HistoryFilters) => Promise<TransactionHistoryItemUnion[]>;
  filters: HistoryFilters;
}

export const HistoryExportMenu = ({ fetchForDownload, filters }: HistoryExportMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const trackEvent = useRootStore((store) => store.trackEvent);

  const open = Boolean(anchorEl);

  const handleDownload = async (format: 'CSV' | 'JSON') => {
    setAnchorEl(null);
    trackEvent(TRANSACTION_HISTORY.DOWNLOAD, { type: format });
    setLoading(true);

    try {
      const data = await fetchForDownload(filters);
      const formattedData = formatTransactionData({ data, csv: format === 'CSV' });

      if (format === 'CSV') {
        downloadData('transactions.csv', toCsv(formattedData), 'text/csv');
      } else {
        downloadData(
          'transactions.json',
          JSON.stringify(formattedData, null, 2),
          'application/json'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={(event) => setAnchorEl(event.currentTarget)}
        variant="outlined"
        disabled={loading}
        aria-haspopup="true"
        aria-expanded={open}
        endIcon={
          loading ? (
            <CircularProgress size={14} color="inherit" />
          ) : (
            <ChevronUpDownIcon sx={{ fontSize: 18, color: 'fg-3' }} />
          )
        }
        sx={{ textTransform: 'none' }}
      >
        <Trans>Export</Trans>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleDownload('CSV')}>
          <ListItemText>
            <Trans>Download CSV</Trans>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleDownload('JSON')}>
          <ListItemText>
            <Trans>Download JSON</Trans>
          </ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};
