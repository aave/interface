import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { MarketSwitcher } from '../MarketSwitcher';

export interface PageTitleProps {
  pageTitle: ReactNode;
  withMarketSwitcher?: boolean;
}

export const PageTitle = ({ pageTitle, withMarketSwitcher }: PageTitleProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
      <Typography variant="h1" sx={{ opacity: '0.7', mr: 3 }}>
        {pageTitle}
      </Typography>
      {withMarketSwitcher && <MarketSwitcher />}
    </Box>
  );
};
