import { Trans } from '@lingui/macro';
import { Box, Divider, Typography } from '@mui/material';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { StakeTokenFormatted } from 'src/hooks/stake/useGeneralStakeUiData';
import {
  SGhoTimeRange,
  sghoTimeRangeOptions,
  useSGhoApyHistory,
} from 'src/hooks/useSGhoApyHistory';
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';

import { MeritApyGraphContainer } from '../graphs/MeritApyGraphContainer';
import { ESupportedTimeRanges, TimeRangeSelector } from '../TimeRangeSelector';

export interface SGhoSavingsRateProps {
  stakeData?: StakeTokenFormatted;
}

export const SGhoSavingsRate: React.FC<SGhoSavingsRateProps> = ({ stakeData }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<SGhoTimeRange>(
    ESupportedTimeRanges.OneWeek
  );

  const {
    data: meritApyHistory,
    loading: loadingMeritApy,
    error: errorMeritApyHistory,
    refetch: refetchMeritApyHistory,
  } = useSGhoApyHistory({ timeRange: selectedTimeRange });
  const { data: stakeAPR } = useStakeTokenAPR();

  if (!stakeData) {
    return null;
  }

  return (
    <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ mr: 2, mb: 2 }}>
          <Typography color="text.secondary" component="span" sx={{ mb: 0.5, display: 'block' }}>
            <Trans>Total Deposited</Trans>
          </Typography>
          <FormattedNumber
            value={stakeData.totalSupplyUSDFormatted}
            variant="main16"
            symbol="USD"
            visibleDecimals={2}
          />
        </Box>

        <Divider
          orientation="vertical"
          sx={{ mx: 2, mb: 2, height: '32px', alignSelf: 'center' }}
        />

        <Box sx={{ ml: 2, mb: 2 }}>
          <Typography color="text.secondary" component="span" sx={{ mb: 0.5, display: 'block' }}>
            <Trans>APR</Trans>
          </Typography>
          <FormattedNumber value={stakeAPR?.apr || 0} percent variant="main16" />
        </Box>
      </Box>

      <MeritApyGraphContainer
        data={meritApyHistory}
        loading={loadingMeritApy}
        error={errorMeritApyHistory}
        onRetry={refetchMeritApyHistory}
        title="GHO APR"
        lineColor="#2EBAC6"
        showAverage={true}
        height={155}
        timeRangeSelector={
          <TimeRangeSelector
            disabled={loadingMeritApy || errorMeritApyHistory}
            timeRanges={sghoTimeRangeOptions}
            selectedTimeRange={selectedTimeRange}
            onTimeRangeChanged={setSelectedTimeRange}
          />
        }
      />
    </Box>
  );
};
