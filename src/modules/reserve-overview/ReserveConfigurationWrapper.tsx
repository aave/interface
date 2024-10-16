import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

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
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));
  const isGho = displayGhoForMintableMarket({ symbol: reserve.symbol, currentMarket });

  return (
    <Paper
      sx={{
        pt: 4,
        pb: 20,
        px: downToXsm ? 4 : 6,
        border: 0,
        borderBottom: '1px solid hsla(0,0%,100%,.2)',
        background:
          'radial-gradient(61.2% 18.19% at 52.96% 0, hsla(0, 0%, 100%, .3) 0, hsla(0, 0%, 60%, 0) 100%), linear-gradient(127deg, hsla(0, 0%, 100%, .15) 2.54%, hsla(0, 0%, 60%, .15) 97.47%);',
        boxShadow: ' 0px 3px 4px 0px rgba(41, 127, 234, 0.15) inset',
        backdropFilter: 'blur(4px)',
        borderRadius: '30px 0 30px 0',
      }}
    >
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
