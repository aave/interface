import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useRootStore } from 'src/store/root';

type ReserveConfigurationProps = {
  reserve: ComputedReserveData;
};

const GhoReserveConfiguration = dynamic(() =>
  import('./Gho/GhoReserveConfiguration').then((module) => module.GhoReserveConfiguration)
);

const ReserveConfiguration = dynamic(() =>
  import('./ReserveConfiguration').then((module) => module.ReserveConfiguration)
);

export const ReserveConfigurationWrapper: React.FC<ReserveConfigurationProps> = ({ reserve }) => {
  const { currentMarket } = useProtocolDataContext();
  const [displayGho] = useRootStore((store) => [store.displayGho]);
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const isGho = displayGho({ symbol: reserve.symbol, currentMarket });

  return (
    <Paper sx={{ pt: 4, pb: 20, px: downToXsm ? 4 : 6 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          mb:
            reserve.isFrozen || reserve.symbol == 'AMPL' || reserve.symbol === 'stETH'
              ? '0px'
              : '36px',
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
