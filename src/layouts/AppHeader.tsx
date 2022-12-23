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
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useHelpContext } from 'src/hooks/useHelp';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { HelpTooltip } from 'src/components/infoTooltips/HelpTooltip';
import { ENABLE_TESTNET } from 'src/utils/marketsAndNetworksConfig';

import { Link } from '../components/primitives/Link';
import { uiConfig } from '../uiConfig';
import { NavItems } from './components/NavItems';
import { MobileMenu } from './MobileMenu';
import { SettingsMenu } from './SettingsMenu';

import TourWidget from './TourWidget';
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
  const xsm = useMediaQuery(breakpoints.down('xsm'));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletWidgetOpen, setWalletWidgetOpen] = useState(false);
  const [tourWidgetOpen, setTourWidgetOpen] = useState(false);

  const { pagination } = useHelpContext();

  useEffect(() => {
    if (mobileMenuOpen && !md) {
      setMobileMenuOpen(false);
    }
    if (walletWidgetOpen) {
      setWalletWidgetOpen(false);
    }
    if (tourWidgetOpen) {
      setTourWidgetOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [md]);

  const headerHeight = 48;

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
          <img src={uiConfig.appLogo} alt="An SVG of an eye" height={34} />
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
        {pagination['SupplyTour'] === 8 && (
          <HelpTooltip
            title={'Restart the any of our Tour at any time.'}
            description={
              <Box>
                Check our other tours to learn more about how to interact with AAVE Protocol.
              </Box>
            }
            pagination={pagination['SupplyTour']}
            placement={'bottom'}
            top={'40px'}
            right={xsm ? '188px' : md ? '198px' : '222px'}
            offset={[20, 30]}
          />
        )}

        {!md && (
          <TourWidget
            open={tourWidgetOpen}
            setOpen={setTourWidgetOpen}
            headerHeight={headerHeight}
          />
        )}
        {!mobileMenuOpen && !walletWidgetOpen && md && (
          <TourWidget
            open={tourWidgetOpen}
            setOpen={setTourWidgetOpen}
            headerHeight={headerHeight}
          />
        )}

        {!md && (
          <WalletWidget
            open={walletWidgetOpen}
            setOpen={setWalletWidgetOpen}
            headerHeight={headerHeight}
          />
        )}
        {!mobileMenuOpen && !tourWidgetOpen && md && (
          <WalletWidget
            open={walletWidgetOpen}
            setOpen={setWalletWidgetOpen}
            headerHeight={headerHeight}
          />
        )}

        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <SettingsMenu />
        </Box>
        {!walletWidgetOpen && !tourWidgetOpen && (
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <MobileMenu
              open={mobileMenuOpen}
              setOpen={setMobileMenuOpen}
              headerHeight={headerHeight}
            />
          </Box>
        )}
      </Box>
    </HideOnScroll>
  );
}
