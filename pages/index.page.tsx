import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { usePermissions } from 'src/hooks/usePermissions';
import { useRootStore } from 'src/store/root';

import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { ContentContainer } from '../src/components/ContentContainer';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardContentWrapper } from '../src/modules/dashboard/DashboardContentWrapper';
import { DashboardTopPanel } from '../src/modules/dashboard/DashboardTopPanel';

export default function Home() {
  const { breakpoints } = useTheme();
  const lg = useMediaQuery(breakpoints.up('lg'));

  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { isPermissionsLoading } = usePermissions();
  const { trackEvent } = useRootStore();

  const [mode, setMode] = useState<'supply' | 'borrow' | ''>('');
  useEffect(() => {
    trackEvent('Page Viewed', {
      'Page Name': 'Dashboard',
    });
    if (!mode) setMode('supply');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lg]);

  return (
    <>
      <DashboardTopPanel />

      <ContentContainer>
        {currentAccount && !isPermissionsLoading && (
          <Box
            sx={{
              display: { xs: 'flex', lg: 'none' },
              justifyContent: { xs: 'center', xsm: 'flex-start' },
              mb: { xs: 3, xsm: 4 },
            }}
          >
            <StyledToggleButtonGroup
              color="primary"
              value={mode}
              exclusive
              onChange={(_, value) => setMode(value)}
              sx={{ width: { xs: '100%', xsm: '359px' }, height: '44px' }}
            >
              <StyledToggleButton value="supply" disabled={mode === 'supply'}>
                <Typography variant="subheader1">
                  <Trans>Supply</Trans>
                </Typography>
              </StyledToggleButton>
              <StyledToggleButton value="borrow" disabled={mode === 'borrow'}>
                <Typography variant="subheader1">
                  <Trans>Borrow</Trans>
                </Typography>
              </StyledToggleButton>
            </StyledToggleButtonGroup>
          </Box>
        )}

        {currentAccount && !isPermissionsLoading ? (
          <DashboardContentWrapper isBorrow={mode === 'borrow'} />
        ) : (
          <ConnectWalletPaper loading={web3Loading} />
        )}
      </ContentContainer>
    </>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
