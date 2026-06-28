import { Box, Skeleton } from '@mui/material';

import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';

const HistoryMobileRowItem = () => {
  return (
    <ListItem px={6} minHeight={68}>
      <ListColumn isRow maxWidth={280}>
        <Skeleton variant="circular" width={24} height={24} />
        <Box sx={{ pl: 6, overflow: 'hidden' }}>
          <Skeleton width={48} height={14} />
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

export const HistoryMobileItemLoader = () => {
  return (
    <>
      <ListItem px={6} minHeight={68}>
        <ListColumn align="left">
          <Skeleton width={80} height={16} sx={{ transform: 'translateY(8px)' }} />
        </ListColumn>
      </ListItem>
      <HistoryMobileRowItem />
      <HistoryMobileRowItem />
      <HistoryMobileRowItem />
    </>
  );
};
