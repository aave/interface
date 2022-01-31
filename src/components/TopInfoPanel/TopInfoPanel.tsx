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
    <Box sx={{ mt: 12, mb: 24, color: 'common.white' }}>
      <PageTitle pageTitle={pageTitle} withMarketSwitcher={withMarketSwitcher} bridge={bridge} />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>{children}</Box>
    </Box>
  );
};
