import { Box, Skeleton } from '@mui/material';

import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';

const HistoryRowItem = () => {
  return (
    <ListItem px={6} minHeight={68}>
      <ListColumn isRow maxWidth={280}>
        <Skeleton variant="circular" width={24} height={24} />
        <Box sx={{ pl: 6, overflow: 'hidden' }}>
          <Skeleton width={48} height={14} />
        </Box>
      </ListColumn>

      <ListColumn isRow align="center">
        <Skeleton width={40} height={12} />
        <Box sx={{ pl: 5, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton width={64} height={14} />
          <Skeleton width={24} height={14} />
        </Box>
      </ListColumn>

      <ListColumn align="right">
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton width={48} height={12} />
          <Skeleton width={120} height={12} />
        </Box>
      </ListColumn>
    </ListItem>
  );
};

export const HistoryItemLoader = () => {
  return (
    <>
      <ListItem px={6} minHeight={68}>
        <ListColumn align="left">
          <Skeleton width={140} height={16} sx={{ transform: 'translateY(8px)' }} />
        </ListColumn>
      </ListItem>
      <HistoryRowItem />
      <HistoryRowItem />
      <HistoryRowItem />
    </>
  );
};
