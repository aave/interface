import { Box, Skeleton } from '@mui/material';

import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';

const rowSize = (compact?: boolean) => ({ px: compact ? 4 : 9, minHeight: compact ? 68 : 72 });

const HistoryRowItem = ({ compact }: { compact?: boolean }) => {
  return (
    <ListItem {...rowSize(compact)}>
      <ListColumn isRow maxWidth={280}>
        <Skeleton variant="circular" width={24} height={24} />
        <Box sx={{ pl: 6, overflow: 'hidden' }}>
          <Skeleton width={48} height={14} />
        </Box>
      </ListColumn>

      {!compact && (
        <ListColumn isRow>
          <Skeleton width={40} height={12} />
          <Box sx={{ pl: 5, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton width={64} height={14} />
            <Skeleton width={24} height={14} />
          </Box>
        </ListColumn>
      )}

      <ListColumn>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton width={48} height={12} />
          <Skeleton width={120} height={12} />
        </Box>
      </ListColumn>
    </ListItem>
  );
};

export const HistoryItemLoader = ({ compact }: { compact?: boolean }) => {
  return (
    <>
      <ListItem {...rowSize(compact)}>
        <ListColumn>
          <Skeleton width={compact ? 80 : 140} height={16} sx={{ transform: 'translateY(8px)' }} />
        </ListColumn>
      </ListItem>
      <HistoryRowItem compact={compact} />
      <HistoryRowItem compact={compact} />
      <HistoryRowItem compact={compact} />
    </>
  );
};
