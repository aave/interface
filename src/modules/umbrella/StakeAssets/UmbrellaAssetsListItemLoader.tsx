import { Box, Skeleton } from '@mui/material';

import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';

export const UmbrellaAssetsListItemLoader = () => {
  return (
    <ListItem px={6} minHeight={76} button>
      <ListColumn isRow minWidth={275}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ pl: 2, overflow: 'hidden' }}>
          <Skeleton width={175} height={24} />
        </Box>
      </ListColumn>

      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>

      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>

      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>

      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>

      <ListColumn>
        <Skeleton width={40} height={40} />
      </ListColumn>
    </ListItem>
  );
};
