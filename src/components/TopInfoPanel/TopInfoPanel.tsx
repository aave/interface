import { Box, Container, ContainerProps, Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { ReactNode } from 'react';
import { pageBandSx } from 'src/components/PageHeader/pageBandSx';

import { PageTitle, PageTitleProps } from './PageTitle';

interface TopInfoPanelProps extends PageTitleProps {
  children?: ReactNode;
  titleComponent?: ReactNode;
  containerProps?: ContainerProps;
  bandSx?: SystemStyleObject<Theme>;
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
  bandSx,
}: TopInfoPanelProps) => {
  return (
    <Box sx={{ ...pageBandSx, ...bandSx }}>
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
