import { Trans } from '@lingui/macro';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { AddressBlocked } from 'src/components/AddressBlockedModal';
import { useAddressAllowed } from 'src/hooks/useAddressAllowed';
import { usePermissions } from 'src/hooks/usePermissions';
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

  const { isAllowed, isLoading: isAddressAllowedLoading } = useAddressAllowed();

  const [mode, setMode] = useState<'supply' | 'borrow' | ''>('');

  useEffect(() => {
    if (!mode) setMode('supply');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lg]);

  return (
    <>
      <DashboardTopPanel />

      {!isAllowed && !isAddressAllowedLoading ? (
        <AddressBlocked address={currentAccount} />
      ) : (
        <ContentContainer>
          {currentAccount && !isPermissionsLoading && (
            <Box
              sx={{
                display: { xs: 'flex', lg: 'none' },
                justifyContent: { xs: 'center', xsm: 'flex-start' },
                mb: { xs: 3, xsm: 4 },
              }}
            >
              <ToggleButtonGroup
                color="primary"
                value={mode}
                exclusive
                onChange={(_, value) => setMode(value)}
                sx={{ width: { xs: '100%', xsm: '359px' }, height: '44px' }}
              >
                <ToggleButton value="supply" disabled={mode === 'supply'}>
                  <Typography variant="subheader1">
                    <Trans>Supply</Trans>
                  </Typography>
                </ToggleButton>
                <ToggleButton value="borrow" disabled={mode === 'borrow'}>
                  <Typography variant="subheader1">
                    <Trans>Borrow</Trans>
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          {currentAccount && !isPermissionsLoading ? (
            <DashboardContentWrapper isBorrow={mode === 'borrow'} />
          ) : (
            <ConnectWalletPaper loading={web3Loading} />
          )}
        </ContentContainer>
      )}
    </>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
