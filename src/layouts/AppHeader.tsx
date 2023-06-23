import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Button,
  Slide,
  SvgIcon,
  Typography,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import Image from 'next/image';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import SwitchNetworkHeader from 'src/maneki/components/SwitchNetworkHeader';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';

import { Link } from '../components/primitives/Link';
import { NavItems } from './components/NavItems';
import { MobileMenu } from './MobileMenu';
import { SettingsMenu } from './SettingsMenu';
import WalletWidget from './WalletWidget';

interface Props {
  children: React.ReactElement;
}

function HideOnScroll({ children }: Props) {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export function AppHeader() {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const sm = useMediaQuery(breakpoints.down('sm'));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletWidgetOpen, setWalletWidgetOpen] = useState(false);

  const { chainId, currentAccount } = useWeb3Context();

  useEffect(() => {
    if (mobileMenuOpen && !md) {
      setMobileMenuOpen(false);
    }
    if (walletWidgetOpen) {
      setWalletWidgetOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [md]);

  const headerHeight = 58;

  const disableTestnet = () => {
    localStorage.setItem('testnetsEnabled', 'false');
    // Set window.location to trigger a page reload when navigating to the the dashboard
    window.location.href = '/';
  };

  const testnetTooltip = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
      <Typography variant="subheader1">
        <Trans>Testnet mode is ON</Trans>
      </Typography>
      <Typography variant="description">
        <Trans>The app is running in testnet mode. Learn how it works in</Trans>{' '}
        <Link
          href="https://docs.aave.com/faq/testing-aave"
          style={{ fontSize: '14px', fontWeight: 400, textDecoration: 'underline' }}
        >
          FAQ.
        </Link>
      </Typography>
      <Button variant="outlined" sx={{ mt: '12px' }} onClick={disableTestnet}>
        <Trans>Disable testnet</Trans>
      </Button>
    </Box>
  );

  return (
    <>
      <HideOnScroll>
        <Box
          component="header"
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          sx={(theme) => ({
            height: '80px',
            position: 'sticky',
            top: 0,
            transition: theme.transitions.create('top'),
            zIndex: theme.zIndex.appBar,
          })}
        >
          {currentAccount && chainId !== 97 && <SwitchNetworkHeader />}
          <Box
            component="header"
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sx={(theme) => ({
              height: '80px',
              position: 'sticky',
              top: 0,
              transition: theme.transitions.create('top'),
              zIndex: theme.zIndex.appBar,
              bgcolor: mobileMenuOpen ? theme.palette.background.paper : 'transparent',
              padding: md ? '8px 12px' : '20px 100px',
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
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
              <Image
                src="/maneki-3d.png"
                alt="Svg of maneki logo"
                width={mobileMenuOpen ? '42px' : '70px'}
                height={mobileMenuOpen ? '42px' : '70px'}
              />
            </Box>
            <Box sx={{ mr: sm ? 1 : 3 }}>
              {ENABLE_TESTNET && (
                <ContentWithTooltip tooltipContent={testnetTooltip} offset={[0, -4]} withoutHover>
                  <Button
                    variant="surface"
                    size="small"
                    color="primary"
                    sx={{
                      backgroundColor: '#B6509E',
                      '&:hover, &.Mui-focusVisible': { backgroundColor: 'rgba(182, 80, 158, 0.7)' },
                    }}
                  >
                    TESTNET
                    <SvgIcon sx={{ marginLeft: '2px', fontSize: '16px' }}>
                      <InformationCircleIcon />
                    </SvgIcon>
                  </Button>
                </ContentWithTooltip>
              )}
            </Box>

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <NavItems />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {!mobileMenuOpen && (
              <WalletWidget
                open={walletWidgetOpen}
                setOpen={setWalletWidgetOpen}
                headerHeight={headerHeight}
              />
            )}

            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <SettingsMenu />
            </Box>

            {!walletWidgetOpen && (
              <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                <MobileMenu
                  open={mobileMenuOpen}
                  setOpen={setMobileMenuOpen}
                  headerHeight={headerHeight}
                />
              </Box>
            )}
          </Box>
        </Box>
      </HideOnScroll>
    </>
  );
}
