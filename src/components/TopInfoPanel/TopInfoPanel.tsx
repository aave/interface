import { Box, Container, ContainerProps } from '@mui/material';
import { ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

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
    <Box
      sx={{
        pt: { xs: 10, md: 12 },
        pb: { xs: 10, md: 12 },
        color: 'fg-1',
        boxShadow: `0px 1px 0px ${figVars['border-0']}`,
        background: `linear-gradient(180deg, ${figVars['info-panel-color-one']} 0%, ${figVars['info-panel-color-two']}, ${figVars['info-panel-color-three']})`,
      }}
    >
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
