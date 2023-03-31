import { Box, Container, useTheme } from '@mui/material';
import { ReactNode } from 'react';

import { uiConfig } from '../../uiConfig';
import { PageTitle, PageTitleProps } from './PageTitle';

interface TopInfoPanelProps extends PageTitleProps {
  children?: ReactNode;
  titleComponent?: ReactNode;
}

export const TopInfoPanel = ({
  pageTitle,
  titleComponent,
  withMarketSwitcher,
  withMigrateButton,
  bridge,
  children,
}: TopInfoPanelProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        backgroundImage: theme.palette.mode === 'dark' ? 'none' : `url(${uiConfig.infoBackground})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right bottom',
        bgcolor: 'background.header',
        pt: { xs: 10, md: 12 },
        pb: { xs: 18, md: 20, lg: '94px', xl: '92px', xxl: '96px' },
        color: 'text.primary',
      }}
    >
      <Container sx={{ pb: 0 }}>
        <Box sx={{ px: { xs: 4, xsm: 6 } }}>
          {!titleComponent && (
            <PageTitle
              pageTitle={pageTitle}
              withMarketSwitcher={withMarketSwitcher}
              withMigrateButton={withMigrateButton}
              bridge={bridge}
            />
          )}

          {titleComponent && titleComponent}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: { xs: 3, xsm: 8 },
              flexWrap: 'wrap',
              width: '100%',
              filter: 'drop-shadow(0px 4px 44px rgba(0, 0, 0, 0.1))',
              mt: '45px',
            }}
          >
            {children}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
