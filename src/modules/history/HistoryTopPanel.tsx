import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { MarketSwitcher } from 'src/components/MarketSwitcher';
import { PageHeader } from 'src/components/PageHeader/PageHeader';

export const HistoryTopPanel = () => {
  return (
    <PageHeader
      disableTitleTypography
      title={
        <Box>
          <Typography variant="h5" sx={{ color: 'fg-3', mb: '0.75rem' }}>
            <Trans>Transaction history</Trans>
          </Typography>
          <MarketSwitcher hideDescription />
        </Box>
      }
      description={<Trans>This list may not include all your swaps.</Trans>}
    />
  );
};
