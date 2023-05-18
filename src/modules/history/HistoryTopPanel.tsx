import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const HistoryTopPanel = () => {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const xsm = useMediaQuery(breakpoints.down('xsm'));

  return (
    <TopInfoPanel
      pageTitle={<></>}
      titleComponent={
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h3" sx={{ color: '#A5A8B6' }}>
              <Trans>Transaction history</Trans>
            </Typography>
          </Box>
          <PageTitle withMarketSwitcher={true} />
          <Box sx={{ width: md ? (xsm ? '320px' : '540px') : '860px' }} />
        </Box>
      }
    />
  );
};
