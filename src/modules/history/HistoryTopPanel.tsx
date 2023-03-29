import { Trans } from '@lingui/macro';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const HistoryTopPanel = () => {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const xsm = useMediaQuery(breakpoints.down('xsm'));
  const { currentMarketData } = useProtocolDataContext();
  return (
    <TopInfoPanel
      pageTitle={<></>}
      titleComponent={
        <Box>
          <PageTitle
            pageTitle={<Trans>{currentMarketData.marketTitle} History</Trans>}
            withMarketSwitcher={true}
          />
          <Box sx={{ width: md ? (xsm ? '320px' : '540px') : '860px' }} />
        </Box>
      }
    />
  );
};
