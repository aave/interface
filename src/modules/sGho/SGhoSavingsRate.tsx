import { TimeWindow } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { convertAprToApy } from 'src/utils/utils';

import { MeritApyGraphContainer } from '../reserve-overview/graphs/MeritApyGraphContainer';
import { TimeRangeSelector } from '../reserve-overview/TimeRangeSelector';

interface SGhoSavingsRateProps {
  totalDepositedUSD: string;
  rate: number;
}

export const SGhoSavingsRate = ({ totalDepositedUSD, rate }: SGhoSavingsRateProps) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeWindow>(TimeWindow.LastWeek);

  // TODO: wire sGHO APY history feed
  const apyHistory: [] = [];
  const loading = false;
  const error = false;

  const apy = convertAprToApy(rate);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subheader1" sx={{ mb: 4 }}>
        <Trans>Savings Rate</Trans>
      </Typography>

      <Stack
        divider={<Divider orientation={xsm ? 'vertical' : 'horizontal'} flexItem />}
        direction={{ xs: 'column', xsm: 'row' }}
        spacing={{ xs: 2, xsm: 8 }}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            <Trans>Total Deposited</Trans>
          </Typography>
          <FormattedNumber
            value={totalDepositedUSD}
            variant="main16"
            symbol="USD"
            visibleDecimals={2}
          />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            <Trans>APR</Trans>
          </Typography>
          <FormattedNumber value={rate} percent variant="main16" visibleDecimals={2} />
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            <Trans>APY, fixed rate</Trans>
          </Typography>
          <FormattedNumber value={apy} percent variant="main16" visibleDecimals={2} />
        </Box>
      </Stack>

      <MeritApyGraphContainer
        data={apyHistory}
        loading={loading}
        error={error}
        title="sGHO APY"
        lineColor="#2EBAC6"
        showAverage={true}
        showLegend={false}
        height={155}
        timeRangeSelector={
          <TimeRangeSelector
            disabled={loading || error}
            timeRanges={[TimeWindow.LastWeek, TimeWindow.LastMonth, TimeWindow.LastSixMonths]}
            selectedTimeRange={selectedTimeRange}
            onTimeRangeChanged={setSelectedTimeRange}
          />
        }
      />
    </Box>
  );
};
