import { Box, Skeleton } from '@mui/material';

import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';
import {
  HISTORY_ACTION_COLUMN,
  HISTORY_ACTIONS_COLUMN,
  HISTORY_DETAILS_COLUMN,
  HISTORY_ROW_MIN_HEIGHT,
  HISTORY_ROW_PX,
  HistoryDateHeading,
} from './HistoryListLayout';

const HistoryRowItem = ({ stacked }: { stacked?: boolean }) => {
  if (stacked) {
    return (
      <ListItem sx={{ px: HISTORY_ROW_PX, py: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width={72} height={18} />
            <Skeleton width={56} height={16} />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton width={120} height={18} />
          </Box>
        </Box>
      </ListItem>
    );
  }

  return (
    <ListItem minHeight={HISTORY_ROW_MIN_HEIGHT} sx={{ px: HISTORY_ROW_PX }}>
      <ListColumn {...HISTORY_ACTION_COLUMN}>
        <Skeleton width={72} height={18} />
        <Skeleton width={56} height={14} />
      </ListColumn>

      <ListColumn {...HISTORY_DETAILS_COLUMN}>
        <Skeleton variant="circular" width={20} height={20} />
        <Box sx={{ pl: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Skeleton width={64} height={18} />
          <Skeleton width={40} height={18} />
        </Box>
      </ListColumn>

      <ListColumn {...HISTORY_ACTIONS_COLUMN}>
        <Skeleton width={72} height={28} sx={{ borderRadius: '0.375rem' }} />
      </ListColumn>
    </ListItem>
  );
};

export const HistoryItemLoader = ({ stacked }: { stacked?: boolean }) => {
  return (
    <>
      <HistoryDateHeading>
        <Skeleton width={stacked ? 80 : 140} height={24} />
      </HistoryDateHeading>
      <HistoryRowItem stacked={stacked} />
      <HistoryRowItem stacked={stacked} />
      <HistoryRowItem stacked={stacked} />
    </>
  );
};
