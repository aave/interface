import { Box, Container } from '@mui/material';
import { ReactNode } from 'react';
import { MainLayout } from 'src/layouts/MainLayout';
import { MarketAssetsListContainer } from 'src/modules/markets/MarketAssetsListContainer';
import { MarketsTopPanel } from 'src/modules/markets/MarketsTopPanel';

interface MarketContainerProps {
  children: ReactNode;
}

export const marketContainerProps = {
  sx: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    pb: '39px',
    px: {
      xs: 2,
      xsm: 5,
      sm: 12,
      md: 5,
      lg: 0,
      xl: '96px',
      xxl: 0,
    },
    maxWidth: {
      xs: 'unset',
      lg: '1240px',
      xl: 'unset',
      xxl: '1440px',
    },
  },
};

export const MarketContainer = ({ children }: MarketContainerProps) => {
  return <Container {...marketContainerProps}>{children}</Container>;
};

export default function Markets() {
  return (
    <>
      <MarketsTopPanel />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          mt: { xs: '-32px', lg: '-46px', xl: '-44px', xxl: '-48px' },
        }}
      >
        <MarketContainer>
          <MarketAssetsListContainer />
        </MarketContainer>
      </Box>
    </>
  );
}

Markets.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
