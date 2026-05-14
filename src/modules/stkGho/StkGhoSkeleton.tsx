import { Box, Grid, Skeleton, Stack } from '@mui/material';

interface StkGhoSkeletonProps {
  hasAccount?: boolean;
}

export const StkGhoSkeleton = ({ hasAccount }: StkGhoSkeletonProps) => {
  return (
    <Grid container spacing={{ xs: 1, md: 2 }} sx={{ mb: 4, minHeight: '600px' }}>
      <Grid item xs={12} md={2}>
        <Box sx={{ mb: { xs: 2, md: 2 } }}>
          <Skeleton variant="rectangular" width={150} height={32} />
        </Box>
      </Grid>

      <Grid item xs={12} md={10}>
        <Box sx={{ mb: { xs: 3, md: 0 } }}>
          <Skeleton variant="rectangular" width="100%" height={24} sx={{ mb: 2 }} />
        </Box>

        {hasAccount && (
          <Box
            sx={(theme) => ({
              borderRadius: { xs: '8px', xsm: '6px' },
              border: `1px solid ${theme.palette.divider}`,
              p: { xs: 3, xsm: 4 },
              marginBottom: 4,
              background: theme.palette.background.paper,
              boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.04)', xsm: 'none' },
            })}
          >
            <Stack spacing={3}>
              <Skeleton variant="rectangular" width="100%" height={60} />
              <Skeleton variant="rectangular" width="100%" height={80} />
            </Stack>
          </Box>
        )}

        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }}>
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />
        </Stack>

        <Box sx={{ mt: 4 }}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
        </Box>
      </Grid>
    </Grid>
  );
};
