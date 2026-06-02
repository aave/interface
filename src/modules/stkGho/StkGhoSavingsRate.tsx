import { TimeWindow } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useSGhoApyHistory } from 'src/hooks/useSGhoApyHistory';
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';
import { convertAprToApy } from 'src/utils/utils';

import { MeritApyGraphContainer } from '../reserve-overview/graphs/MeritApyGraphContainer';
import { TimeRangeSelector } from '../reserve-overview/TimeRangeSelector';

interface StkGhoSavingsRateProps {
  totalDepositedUSD: string;
}

export const StkGhoSavingsRate = ({ totalDepositedUSD }: StkGhoSavingsRateProps) => {
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));

  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeWindow>(TimeWindow.LastWeek);

  const {
    data: meritApyHistory,
    loading: loadingMeritApy,
    error: errorMeritApyHistory,
    refetch: refetchMeritApyHistory,
  } = useSGhoApyHistory({ timeRange: selectedTimeRange });
  const { data: stakeAPR } = useStakeTokenAPR();
  const stakeApyDecimal = stakeAPR?.apr ? convertAprToApy(parseFloat(stakeAPR.apr)) : 0;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="subheader1" sx={{ mb: 4 }}>
        <Trans>stkGHO Savings Rate</Trans>
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
            <Trans>APY</Trans>
          </Typography>
          <FormattedNumber value={stakeApyDecimal} percent variant="main16" />
        </Box>
      </Stack>

      <MeritApyGraphContainer
        data={meritApyHistory}
        loading={loadingMeritApy}
        error={errorMeritApyHistory}
        onRetry={refetchMeritApyHistory}
        showLegend={false}
        lineColor="#2EBAC6"
        showAverage={true}
        height={155}
        timeRangeSelector={
          <TimeRangeSelector
            disabled={loadingMeritApy || errorMeritApyHistory}
            timeRanges={[TimeWindow.LastWeek, TimeWindow.LastMonth, TimeWindow.LastSixMonths]}
            selectedTimeRange={selectedTimeRange}
            onTimeRangeChanged={setSelectedTimeRange}
          />
        }
      />
    </Box>
  );
};
