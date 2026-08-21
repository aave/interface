import { Box, Container, ContainerProps } from '@mui/material';
import { ReactNode } from 'react';
import { pageBandSx } from 'src/components/PageHeader/pageBandSx';

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
  withFavoriteButton,
  bridge,
  children,
  containerProps = {},
}: TopInfoPanelProps) => {
  return (
    <Box sx={pageBandSx}>
      <Container {...containerProps} sx={{ ...containerProps.sx, pb: 0 }}>
        <Box>
          {!titleComponent && (
            <PageTitle
              pageTitle={pageTitle}
              withMarketSwitcher={withMarketSwitcher}
              withMigrateButton={withMigrateButton}
              withFavoriteButton={withFavoriteButton}
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
      </Container>
    </Box>
  );
};
