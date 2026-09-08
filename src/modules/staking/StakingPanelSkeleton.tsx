import { Paper, Skeleton, Stack } from '@mui/material';
import { cardPaddingSx } from 'src/utils/cardStyles';

export const StakingPanelSkeleton = () => {
  return (
    <Paper variant="card" sx={{ ...cardPaddingSx, height: '100%', minHeight: '546px' }}>
      <Stack gap={4} direction="column">
        <Skeleton sx={{ mb: 4 }} variant="rectangular" height={28} width={110} />
        <Skeleton sx={{ borderRadius: 1 }} variant="rectangular" height={70} />
        <Stack gap={4} sx={{ flexDirection: { sm: 'row', xsm: 'column' } }}>
          <Skeleton sx={{ borderRadius: 1 }} variant="rectangular" height={190} width="100%" />
          <Skeleton sx={{ borderRadius: 1 }} variant="rectangular" height={190} width="100%" />
        </Stack>
      </Stack>
    </Paper>
  );
};
