import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { isGhoAndSupported } from 'src/utils/ghoUtilities';

import { GhoReserveConfiguration } from './Gho/GhoReserveConfiguration';
import { ReserveConfiguration } from './ReserveConfiguration';

type ReserveConfigurationProps = {
  reserve: ComputedReserveData;
};

export const ReserveConfigurationWrapper: React.FC<ReserveConfigurationProps> = ({ reserve }) => {
  const { currentMarket } = useProtocolDataContext();
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const isGho = isGhoAndSupported({ symbol: reserve.symbol, currentMarket });

  return (
    <Paper sx={{ py: 4, px: downToXsm ? 4 : 6 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          mb: reserve.isFrozen ? '0px' : '36px',
        }}
      >
        <Typography variant="h3">
          <Trans>Reserve status &#38; configuration</Trans>
        </Typography>
      </Box>
      {isGho ? (
        <GhoReserveConfiguration reserve={reserve} />
      ) : (
        <ReserveConfiguration reserve={reserve} />
      )}
    </Paper>
  );
};
