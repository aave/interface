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

import { ConnectWalletPaper } from '../src/components/ConnectWalletPaper';
import { ContentContainer } from '../src/components/ContentContainer';
import { MainLayout } from '../src/layouts/MainLayout';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { DashboardContentWrapper } from '../src/modules/dashboard/DashboardContentWrapper';
import { DashboardTopPanel } from '../src/modules/dashboard/DashboardTopPanel';

export default function Home() {
  const { breakpoints } = useTheme();
  const lg = useMediaQuery(breakpoints.up('lg'));

  const { currentAccount } = useWeb3Context();

  const [mode, setMode] = useState('supply');

  useEffect(() => {
    setMode('supply');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lg]);

  return (
    <>
      <DashboardTopPanel />

      <ContentContainer>
        <Box
          sx={{
            display: { xxs: 'flex', lg: 'none' },
            justifyContent: { xxs: 'center', xs: 'flex-start' },
            mb: { xxs: 3, xs: 4 },
          }}
        >
          <ToggleButtonGroup
            color="primary"
            value={mode}
            exclusive
            onChange={(_, value) => setMode(value)}
            sx={{ width: '359px' }}
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

        {currentAccount ? (
          <DashboardContentWrapper isBorrow={mode === 'borrow'} />
        ) : (
          <ConnectWalletPaper />
        )}
      </ContentContainer>
    </>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};
