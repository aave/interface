import { Slide, useMediaQuery, useScrollTrigger, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import * as React from 'react';
import { useEffect, useState } from 'react';
import UserMenuDropdown from 'src/components/UserMenuDropdown';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { Link } from '../components/primitives/Link';
import { uiConfig } from '../uiConfig';
import { NavItems } from './components/NavItems';

interface Props {
  children: React.ReactElement;
}

function HideOnScroll({ children }: Props) {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const trigger = useScrollTrigger({ threshold: md ? 160 : 80 });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export function AppHeader() {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));

  const [mobileDrawerOpen, setMobileDrawerOpen] = useRootStore(
    useShallow((state) => [
      state.mobileDrawerOpen,
      state.setMobileDrawerOpen,
      state.currentMarketData,
    ])
  );

  const [walletWidgetOpen, setWalletWidgetOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [account] = useRootStore(useShallow((state) => [state.account]));

  useEffect(() => {
    if (mobileDrawerOpen && !md) {
      setMobileDrawerOpen(false);
    }
    if (walletWidgetOpen) {
      setWalletWidgetOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [md]);

  const headerHeight = 48;

  return (
    <HideOnScroll>
      <Box
        component="header"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sx={(theme) => ({
          height: headerHeight,
          position: 'sticky',
          top: 0,
          transition: theme.transitions.create('top'),
          zIndex: theme.zIndex.appBar,
          bgcolor: theme.palette.background.header,
          padding: {
            xs: mobileMenuOpen || walletWidgetOpen ? '8px 20px' : '8px 8px 8px 20px',
            xsm: '8px 20px',
          },
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'space-between',
          boxShadow: 'inset 0px -1px 0px rgba(242, 243, 247, 0.16)',
        })}
      >
        <Box
          component={Link}
          href="/"
          aria-label="Go to homepage"
          sx={{
            lineHeight: 0,
            mr: 3,
            transition: '0.3s ease all',
            '&:hover': { opacity: 0.7 },
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <img src={uiConfig.appLogo} alt="AAVE" width={72} height={20} />
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <NavItems />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {account ? <UserMenuDropdown /> : <ConnectWalletButton />}
      </Box>
    </HideOnScroll>
  );
}
