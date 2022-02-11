import { Box } from '@mui/material';
import { ReactNode } from 'react';

import { PageTitle, PageTitleProps } from './PageTitle';

interface TopInfoPanelProps extends PageTitleProps {
  children?: ReactNode;
}

export const TopInfoPanel = ({
  pageTitle,
  withMarketSwitcher,
  bridge,
  children,
}: TopInfoPanelProps) => {
  return (
    <Box
      sx={{
        mt: { xxs: 10, md: 12 },
        mb: { xxs: 7.5, xs: 10, sm: 11.5, lg: 16, xl: 20, xxl: 24 },
        px: 6,
        color: 'common.white',
      }}
    >
      <PageTitle pageTitle={pageTitle} withMarketSwitcher={withMarketSwitcher} bridge={bridge} />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>{children}</Box>
    </Box>
  );
};
