import { Box, Grid, Skeleton, Stack } from '@mui/material';

interface SavingsCardSkeletonProps {
  hasAccount?: boolean;
}

export const SavingsCardSkeleton = ({ hasAccount }: SavingsCardSkeletonProps) => {
  return (
    <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 4, minHeight: '600px' }}>
      <Grid item xs={12}>
        {hasAccount && (
          <Box
            sx={(theme) => ({
              borderRadius: { xs: '8px', xsm: '6px' },
              border: `1px solid ${theme.palette.divider}`,
              p: 4,
              mb: 4,
              background: theme.palette.background.paper,
            })}
          >
            <Stack spacing={3}>
              <Skeleton variant="rectangular" width="100%" height={60} />
            </Stack>
          </Box>
        )}

        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />
        </Stack>

        <Box sx={{ mt: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
        </Box>
      </Grid>
    </Grid>
  );
};
