import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { CONTENT_TOP_PADDING, ContentContainer } from '../src/components/ContentContainer';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardContentWrapper } from '../src/modules/dashboard/DashboardContentWrapper';
import { DashboardTopPanel } from '../src/modules/dashboard/DashboardTopPanel';

export default function Dashboard() {
  const { currentAccount } = useWeb3Context();
  const [trackEvent, currentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket])
  );

  const [mode, setMode] = useState<'supply' | 'borrow' | ''>('supply');

  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Dashboard',
      Market: currentMarket,
    });
  }, [trackEvent]);

  return (
    <>
      <DashboardTopPanel />

      <ContentContainer>
        {currentAccount && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              mb: '1.5rem',
            }}
          >
            <Typography variant="h2" sx={{ color: 'fg-1' }}>
              <Trans>Your Positions</Trans>
            </Typography>
            <Button variant="outlined" component={Link} size="medium" href={ROUTES.history}>
              <Trans>View transactions</Trans>
            </Button>
          </Box>
        )}

        {currentAccount && (
          <Box
            sx={{
              display: { xs: 'flex', lg: 'none' },
              justifyContent: { xs: 'center', xsm: 'flex-start' },
              mb: CONTENT_TOP_PADDING,
            }}
          >
            <StyledTxModalToggleGroup
              color="primary"
              value={mode}
              exclusive
              onChange={(_, value) => setMode(value)}
              sx={{ width: { xs: '100%', xsm: '359px' } }}
            >
              <StyledTxModalToggleButton value="supply" disabled={mode === 'supply'}>
                <Typography variant="subheader1">
                  <Trans>Supply</Trans>
                </Typography>
              </StyledTxModalToggleButton>
              <StyledTxModalToggleButton value="borrow" disabled={mode === 'borrow'}>
                <Typography variant="subheader1">
                  <Trans>Borrow</Trans>
                </Typography>
              </StyledTxModalToggleButton>
            </StyledTxModalToggleGroup>
          </Box>
        )}

        {currentAccount ? (
          <DashboardContentWrapper isBorrow={mode === 'borrow'} />
        ) : (
          <ConnectWalletPaper />
        )}
      </ContentContainer>
    </>
  );
}

Dashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
