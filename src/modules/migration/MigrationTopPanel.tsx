import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';

export const MigrationTopPanel = () => {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const xsm = useMediaQuery(breakpoints.down('xsm'));

  return (
    <TopInfoPanel
      pageTitle={<></>}
      titleComponent={
        <Box>
          <PageTitle pageTitle={<Trans>Migration</Trans>} withMarketSwitcher={true} />
          <Box sx={{ width: md ? (xsm ? '320px' : '540px') : '860px' }}>
            <Typography variant="description" color="#A5A8B6">
              <Trans>TODO: text about migration</Trans>
            </Typography>
          </Box>
        </Box>
      }
    />
  );
};
