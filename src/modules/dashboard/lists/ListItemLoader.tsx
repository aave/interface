import { Box, Skeleton } from '@mui/material';

import { ListColumn } from '../../../components/lists/ListColumn';
import { ListItem } from '../../../components/lists/ListItem';
import { ListButtonsColumn } from './ListButtonsColumn';

export const ListItemLoader = ({ columns }: { columns: number }) => {
  return (
    <ListItem>
      <ListColumn maxWidth={160} isRow>
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton sx={{ ml: 3 }} width={39} height={20} />
        </Box>
      </ListColumn>

      {Array.from({ length: columns - 1 }).map((_, index) => (
        <ListColumn key={index}>
          <Skeleton width={70} height={20} />
        </ListColumn>
      ))}

      <ListButtonsColumn>
        <Skeleton height={38} width={74} />
        <Skeleton height={38} width={74} sx={{ ml: '6px' }} />
      </ListButtonsColumn>
    </ListItem>
  );
};
