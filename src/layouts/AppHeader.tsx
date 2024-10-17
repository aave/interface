import {
  InformationCircleIcon,
  SparklesIcon,
  SwitchHorizontalIcon,
} from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Badge,
  Button,
  NoSsr,
  Slide,
  styled,
  SvgIcon,
  Typography,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { ENABLE_TESTNET, FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

import { Link } from '../components/primitives/Link';
import { useProtocolDataContext } from '../hooks/useProtocolDataContext';
import { uiConfig } from '../uiConfig';
import { NavItems } from './components/NavItems';
import { MobileMenu } from './MobileMenu';
import { SettingsMenu } from './SettingsMenu';
import WalletWidget from './WalletWidget';

interface Props {
  children: React.ReactElement;
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    top: '2px',
    right: '2px',
    borderRadius: '20px',
    width: '10px',
    height: '10px',
    backgroundColor: `${theme.palette.secondary.main}`,
    color: `${theme.palette.secondary.main}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

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

const SWITCH_VISITED_KEY = 'switchVisited';

export function AppHeader() {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const sm = useMediaQuery(breakpoints.down('sm'));
  const smd = useMediaQuery('(max-width:1120px)');

  const [visitedSwitch, setVisitedSwitch] = useState(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(localStorage.getItem(SWITCH_VISITED_KEY));
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useRootStore((state) => [
    state.mobileDrawerOpen,
    state.setMobileDrawerOpen,
  ]);

  const { openSwitch, openBridge } = useModalContext();

  const { currentMarketData } = useProtocolDataContext();
  const [walletWidgetOpen, setWalletWidgetOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const toggleWalletWigit = (state: boolean) => {
    if (md) setMobileDrawerOpen(state);
    setWalletWidgetOpen(state);
  };

  const toggleMobileMenu = (state: boolean) => {
    if (md) setMobileDrawerOpen(state);
    setMobileMenuOpen(state);
  };

  const disableTestnet = () => {
    localStorage.setItem('testnetsEnabled', 'false');
    // Set window.location to trigger a page reload when navigating to the the dashboard
    window.location.href = '/';
  };

  const disableFork = () => {
    localStorage.setItem('testnetsEnabled', 'false');
    localStorage.removeItem('forkEnabled');
    localStorage.removeItem('forkBaseChainId');
    localStorage.removeItem('forkNetworkId');
    localStorage.removeItem('forkRPCUrl');
    // Set window.location to trigger a page reload when navigating to the the dashboard
    window.location.href = '/';
  };

  const handleSwitchClick = () => {
    localStorage.setItem(SWITCH_VISITED_KEY, 'true');
    setVisitedSwitch(true);
    openSwitch();
  };

  const handleBridgeClick = () => {
    openBridge();
  };

  const testnetTooltip = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
      <Typography variant="subheader1">
        <Trans>Testnet mode is ON</Trans>
      </Typography>
      <Typography variant="description">
        <Trans>The app is running in testnet mode. Learn how it works in</Trans>{' '}
        <Link
          href="https://aave.com/faq"
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

  const forkTooltip = (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
      <Typography variant="subheader1">
        <Trans>Fork mode is ON</Trans>
      </Typography>
      <Typography variant="description">
        <Trans>The app is running in fork mode.</Trans>
      </Typography>
      <Button variant="outlined" sx={{ mt: '12px' }} onClick={disableFork}>
        <Trans>Disable fork</Trans>
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
          <img src={uiConfig.appLogo} alt="AAVE" width={72} height={20} />
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
        <Box sx={{ mr: sm ? 1 : 3 }}>
          {FORK_ENABLED && currentMarketData?.isFork && (
            <ContentWithTooltip tooltipContent={forkTooltip} offset={[0, -4]} withoutHover>
              <Button
                variant="surface"
                size="small"
                color="primary"
                sx={{
                  backgroundColor: '#B6509E',
                  '&:hover, &.Mui-focusVisible': { backgroundColor: 'rgba(182, 80, 158, 0.7)' },
                }}
              >
                FORK
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

        <NoSsr>
          <StyledBadge
            invisible={visitedSwitch}
            variant="dot"
            badgeContent=""
            color="secondary"
            sx={{ mr: 2 }}
          >
            <Button
              onClick={handleBridgeClick}
              variant="surface"
              sx={{ p: '7px 8px', minWidth: 'unset', gap: 2, alignItems: 'center' }}
            >
              {!smd && (
                <Typography component="span" typography="subheader1">
                  Bridge GHO
                </Typography>
              )}
              <SvgIcon fontSize="small">
                <SparklesIcon />
              </SvgIcon>
            </Button>
          </StyledBadge>
        </NoSsr>

        <NoSsr>
          <StyledBadge
            invisible={true}
            variant="dot"
            badgeContent=""
            color="secondary"
            sx={{ mr: 2 }}
          >
            <Button
              onClick={handleSwitchClick}
              variant="surface"
              sx={{ p: '7px 8px', minWidth: 'unset', gap: 2, alignItems: 'center' }}
              aria-label="Switch tool"
            >
              {!smd && (
                <Typography component="span" typography="subheader1">
                  Switch tokens
                </Typography>
              )}
              <SvgIcon fontSize="small">
                <SwitchHorizontalIcon />
              </SvgIcon>
            </Button>
          </StyledBadge>
        </NoSsr>

        {!mobileMenuOpen && (
          <WalletWidget
            open={walletWidgetOpen}
            setOpen={toggleWalletWigit}
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
              setOpen={toggleMobileMenu}
              headerHeight={headerHeight}
            />
          </Box>
        )}
      </Box>
    </HideOnScroll>
  );
}
