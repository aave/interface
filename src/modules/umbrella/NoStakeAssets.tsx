import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';

export const NoStakeAssets = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        pt: 15,
        pb: 32,
        px: 4,
      }}
    >
      <Typography variant="h3" sx={{ textAlign: 'center' }}>
        <Trans>There are no stake assets configured for this market</Trans>
      </Typography>
    </Box>
  );
};
