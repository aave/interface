import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';

const SGhoConfiguration = dynamic(() =>
  import('src/modules/reserve-overview/SGho/SGhoConfiguration').then(
    (module) => module.SGhoConfiguration
  )
);

export const SGhoWrapper: React.FC = () => {
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));

  return (
    <Paper sx={{ pt: 4, pb: 20, px: downToXsm ? 4 : 6 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          mb: '36px',
        }}
      >
        <Typography variant="h3">
          <Trans>Savings GHO (sGHO)</Trans>
        </Typography>
      </Box>
      <SGhoConfiguration />
    </Paper>
  );
};
