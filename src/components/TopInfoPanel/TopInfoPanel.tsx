import { Box, ContainerProps } from '@mui/material';
import { ReactNode } from 'react';

import { MainContainer } from '../MainContainer';
import { PageTitle, PageTitleProps } from './PageTitle';

interface TopInfoPanelProps extends PageTitleProps {
  children?: ReactNode;
  titleComponent?: ReactNode;
  containerProps?: ContainerProps;
}

export const TopInfoPanel = ({
  pageTitle,
  titleComponent,
  withMarketSwitcher,
  withMigrateButton,
  bridge,
  children,
  containerProps = {},
}: TopInfoPanelProps) => {
  return (
    <Box
      sx={{
        bgcolor: 'background.header',
        pt: { xs: 10, md: 12 },
        pb: { xs: 18, md: 20, lg: '94px', xl: '92px', xxl: '96px' },
        color: '#F1F1F3',
      }}
    >
      <MainContainer {...containerProps} sx={{ ...containerProps.sx, pb: 0 }}>
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
            }}
          >
            {children}
          </Box>
        </Box>
      </MainContainer>
    </Box>
  );
};
