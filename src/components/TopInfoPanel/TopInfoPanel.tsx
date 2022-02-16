import { Box, Container } from '@mui/material';
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
        bgcolor: '#090815',
        pt: { xs: 10, md: 12 },
        pb: { xs: 16, xsm: 18.5, sm: 20, md: '75px', lg: '110px', xl: '124px', xxl: '144px' },
        color: 'common.white',
      }}
    >
      <Container sx={{ pb: 0 }}>
        <Box sx={{ px: 6 }}>
          <PageTitle
            pageTitle={pageTitle}
            withMarketSwitcher={withMarketSwitcher}
            bridge={bridge}
          />
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 3, xsm: 8 },
              flexWrap: 'wrap',
              width: '100%',
            }}
          >
            {children}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
