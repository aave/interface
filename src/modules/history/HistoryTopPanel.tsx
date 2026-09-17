import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';

export const HistoryTopPanel = () => {
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
        </Box>
      }
    />
  );
};
