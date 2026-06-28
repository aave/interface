import { Box, Skeleton, useMediaQuery, useTheme } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListItem } from 'src/components/lists/ListItem';

export const MigrationListItemLoader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(1125));

  if (isMobile) {
    return <MigrationListItemLoaderMobile />;
  }

  return (
    <ListItem sx={{ pl: 0 }}>
      <ListColumn align="center" maxWidth={64} minWidth={64}>
        <Skeleton width={16} height={16} />
      </ListColumn>

      <ListColumn align="left" isRow maxWidth={250} minWidth={170}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton sx={{ ml: 3 }} width={39} height={20} />
        </Box>
      </ListColumn>

      <ListColumn>
        <Skeleton width={120} height={25} />
      </ListColumn>

      <ListColumn>
        <Skeleton width={120} height={25} />
      </ListColumn>

      <ListColumn>
        <Skeleton width={120} height={25} />
      </ListColumn>

      <ListColumn>
        <Skeleton width={70} height={16} sx={{ mb: 1 }} />
        <Skeleton width={50} height={14} />
      </ListColumn>
    </ListItem>
  );
};

const MigrationListItemLoaderMobile = () => {
  return (
    <ListItem sx={{ display: 'flex', flexDirection: 'column', pl: 0 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          pb: 2,
          pt: 2.5,
        }}
      >
        <ListColumn align="center" maxWidth={48} minWidth={48}>
          <Skeleton width={16} height={16} />
        </ListColumn>
        <ListColumn align="left">
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton sx={{ ml: 3 }} width={39} height={20} />
          </Box>
        </ListColumn>
      </Box>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, pb: 4, pl: 12 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton width={130} height={16} />
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Skeleton width={50} height={16} />
            <Skeleton width={30} height={14} />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Skeleton width={80} height={16} />
          <Skeleton width={115} height={16} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Skeleton width={115} height={16} />
          <Skeleton width={150} height={16} />
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Skeleton width={140} height={16} />
          <Skeleton width={115} height={16} />
        </Box>
      </Box>
    </ListItem>
  );
};
