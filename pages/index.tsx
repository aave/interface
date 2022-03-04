import { Trans } from '@lingui/macro';
import {
  Box,
  styled,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import sx from '@mui/system/sx';
import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { ContentContainer } from '../src/components/ContentContainer';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardContentWrapper } from '../src/modules/dashboard/DashboardContentWrapper';
import { DashboardTopPanel } from '../src/modules/dashboard/DashboardTopPanel';

const ToggleButtonInternal = styled(Box)(
  sx({
    backgroundColor: '#FFFFFF',
    boxShadow: '0px 1px 0px rgba(0, 0, 0, 0.05)',
    borderRadius: '4px',
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  })
);

export default function Home() {
  const { breakpoints } = useTheme();
  const lg = useMediaQuery(breakpoints.up('lg'));

  const { currentAccount, loading: web3Loading } = useWeb3Context();

  const [mode, setMode] = useState<'supply' | 'borrow' | ''>('');

  useEffect(() => {
    if (!mode) setMode('supply');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lg]);

  return (
    <>
      <DashboardTopPanel />

      <ContentContainer>
        {currentAccount && (
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
              <ToggleButton value="supply" disabled={mode === 'supply'} sx={{ p: '4px' }}>
                {mode === 'supply' ? (
                  <ToggleButtonInternal>
                    <Typography variant="subheader1Gradient" sx={{ alignSelf: 'center' }}>
                      <Trans>Supply</Trans>
                    </Typography>
                  </ToggleButtonInternal>
                ) : (
                  <Typography variant="subheader1">
                    <Trans>Supply</Trans>
                  </Typography>
                )}
              </ToggleButton>
              <ToggleButton value="borrow" disabled={mode === 'borrow'} sx={{ p: '4px' }}>
                {mode === 'borrow' ? (
                  <ToggleButtonInternal>
                    <Typography variant="subheader1Gradient" sx={{ alignSelf: 'center' }}>
                      <Trans>Borrow</Trans>
                    </Typography>
                  </ToggleButtonInternal>
                ) : (
                  <Typography variant="subheader1">
                    <Trans>Borrow</Trans>
                  </Typography>
                )}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        {currentAccount ? (
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
