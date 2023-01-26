import { Box, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';

export const MigrationListItemLoader = () => {
  const { breakpoints } = useTheme();
  const isTablet = useMediaQuery(breakpoints.up('md'));

  return (
    <ListItem>
      <ListColumn align="center" maxWidth={isTablet ? 100 : 60}>
        <Skeleton width={16} height={16} />
      </ListColumn>

      <ListColumn align="left" maxWidth={280}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton sx={{ ml: 3 }} width={39} height={20} />
        </Box>
      </ListColumn>

      <ListColumn align="right">
        <Skeleton width={70} height={16} sx={{ mb: 1 }} />
        <Skeleton width={50} height={14} />
      </ListColumn>
    </ListItem>
  );
};
