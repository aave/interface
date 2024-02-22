import { Paper, Skeleton, Stack } from '@mui/material';

export const StakingPanelSkeleton = () => {
  return (
    <Paper sx={{ p: { xs: 4, xsm: 6 }, pt: 4, height: '100%', minHeight: '546px' }}>
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
