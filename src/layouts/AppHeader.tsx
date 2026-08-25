import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Badge,
  Button,
  CircularProgress,
  Container,
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
import { AvatarSize } from 'src/components/Avatar';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { AaveLogo } from 'src/components/icons/AaveLogo';
import { BridgeIcon } from 'src/components/icons/BridgeIcon';
import { SwapIcon } from 'src/components/icons/SwapIcon';
import { AAVE_PRO_URL } from 'src/components/MarketSwitcher';
import { UserDisplay } from 'src/components/UserDisplay';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useConnectGate } from 'src/hooks/useConnectGate';
import { useModalContext } from 'src/hooks/useModal';
import { useSwapOrdersTracking } from 'src/hooks/useSwapOrdersTracking';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { iconButtonSx } from 'src/utils/buttonStyles';
import { figVars } from 'src/utils/figmaColors';
import { ENABLE_TESTNET, FORK_ENABLED, isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { darkScheme } from 'src/utils/theme';
import { useShallow } from 'zustand/shallow';

import { Link } from '../components/primitives/Link';
import { NavItems } from './components/NavItems';
import { MobileMenu } from './MobileMenu';
import { SettingsMenu } from './SettingsMenu';

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
    backgroundColor: `${theme.vars.palette.secondary.main}`,
    color: `${theme.vars.palette.secondary.main}`,
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
  const mdlg = useMediaQuery(breakpoints.down('mdlg'));
  const trigger = useScrollTrigger({ threshold: 80 });

  // Mobile keeps the header pinned (never hides on scroll); desktop still hides past the threshold.
  return (
    <Slide appear={false} direction="down" in={mdlg || !trigger}>
      {children}
    </Slide>
  );
}

const SWITCH_VISITED_KEY = 'switchVisited';

// Dev-only environment badges (testnet / fork) — intentionally off-brand magenta to stand out.
const envBadgeSx = {
  backgroundColor: '#B6509E',
  boxShadow: 'none',
  '&:hover, &.Mui-focusVisible': { backgroundColor: 'rgba(182, 80, 158, 0.7)', boxShadow: 'none' },
  // The pill variant tints on hover via a ::before overlay; the badge steps its own fill instead.
  '&:hover::before, &.Mui-focusVisible::before': { backgroundColor: 'transparent' },
};

export function AppHeader() {
  const { breakpoints } = useTheme();
  const mdlg = useMediaQuery(breakpoints.down('mdlg'));
  const sm = useMediaQuery(breakpoints.down('sm'));
  const lg = useMediaQuery(breakpoints.down('lg'));
  // Shared by the Swap + Bridge triggers: icon-only square when collapsed (below lg), text otherwise.
  const collapsingTriggerSx = lg
    ? [iconButtonSx, { alignItems: 'center', '& .MuiButton-startIcon': { mx: 0 } }]
    : { p: '0 0.88rem', minWidth: 'unset', alignItems: 'center' };

  const [, setVisitedSwitch] = useState(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(localStorage.getItem(SWITCH_VISITED_KEY));
  });

  const [mobileDrawerOpen, setMobileDrawerOpen, currentMarketData] = useRootStore(
    useShallow((state) => [
      state.mobileDrawerOpen,
      state.setMobileDrawerOpen,
      state.currentMarketData,
    ])
  );

  const showSwitchButton = isFeatureEnabled.switch(currentMarketData);

  const { openSwitch, openBridge, openReadMode } = useModalContext();
  const { readOnlyMode } = useWeb3Context();
  const openOrConnect = useConnectGate();
  const { hasActiveOrders } = useSwapOrdersTracking();

  useEffect(() => {
    if (!mdlg) {
      setMobileDrawerOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mdlg]);

  const headerHeight = 72;

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
    openOrConnect(openSwitch);
  };

  const handleBridgeClick = () => {
    openOrConnect(openBridge);
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
      <Button variant="tertiary" sx={{ mt: '12px' }} onClick={disableTestnet}>
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
      <Button variant="tertiary" sx={{ mt: '12px' }} onClick={disableFork}>
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
          bgcolor: 'bg-3',
          ...darkScheme({ backgroundColor: figVars['bg-2'] }),
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxShadow: `inset 0px -1px 0px ${figVars['border-0']}`,
        })}
      >
        <Container
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            pb: 0,
          }}
        >
          <Box
            component={Link}
            href="/"
            aria-label="Go to homepage"
            sx={{
              lineHeight: 0,
              mr: 3,
              color: 'fg-1',
              transition: '0.3s ease all',
              '&:hover': { opacity: 0.7 },
            }}
            onClick={() => setMobileDrawerOpen(false)}
          >
            <AaveLogo width="5.26144rem" height="0.875rem" />
          </Box>
          <Box sx={{ mr: sm ? 1 : 3 }}>
            {ENABLE_TESTNET && (
              <ContentWithTooltip tooltipContent={testnetTooltip} offset={[0, -4]} withoutHover>
                <Button variant="tertiary" size="small" color="primary" sx={envBadgeSx}>
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
                <Button variant="tertiary" size="small" color="primary" sx={envBadgeSx}>
                  FORK
                  <SvgIcon sx={{ marginLeft: '2px', fontSize: '16px' }}>
                    <InformationCircleIcon />
                  </SvgIcon>
                </Button>
              </ContentWithTooltip>
            )}
          </Box>

          <Box sx={{ display: { xs: 'none', mdlg: 'block' } }}>
            <NavItems />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <NoSsr>
            <Button
              component={Link}
              href={AAVE_PRO_URL}
              variant="tertiary"
              sx={{
                p: '0 0.88rem',
                minWidth: 'unset',
                alignItems: 'center',
                mr: '0.62rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Typography component="span" variant="buttonM">
                {lg ? 'V4' : 'Aave V4'}
              </Typography>
            </Button>
          </NoSsr>

          <NoSsr>
            <StyledBadge
              invisible={true}
              variant="dot"
              badgeContent=""
              color="secondary"
              sx={{ mr: '0.62rem', display: { xs: 'none', mdlg: 'inline-flex' } }}
            >
              <Button
                onClick={handleSwitchClick}
                variant="tertiary"
                startIcon={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {hasActiveOrders ? (
                      <CircularProgress
                        size={20}
                        sx={{
                          color: (theme) => theme.vars.palette.grey[200],
                        }}
                      />
                    ) : (
                      <SwapIcon sx={{ fontSize: '18px' }} />
                    )}
                  </Box>
                }
                sx={collapsingTriggerSx}
                aria-label="Switch tool"
                disabled={!showSwitchButton}
              >
                {!lg && (
                  <Typography component="span" variant="buttonM">
                    Swap
                  </Typography>
                )}
              </Button>
            </StyledBadge>
          </NoSsr>

          <NoSsr>
            <StyledBadge
              invisible={true}
              // variant="dot"
              badgeContent=""
              color="secondary"
              sx={{ mr: '0.62rem', display: { xs: 'none', mdlg: 'inline-flex' } }}
            >
              <Button
                onClick={handleBridgeClick}
                variant="tertiary"
                startIcon={<BridgeIcon sx={{ fontSize: '18px' }} />}
                sx={collapsingTriggerSx}
              >
                {!lg && (
                  <Typography component="span" variant="buttonM">
                    Bridge GHO
                  </Typography>
                )}
              </Button>
            </StyledBadge>
          </NoSsr>

          {readOnlyMode ? (
            <Button
              variant="tertiary"
              onClick={() => {
                openReadMode();
              }}
            >
              <UserDisplay
                avatarProps={{ size: AvatarSize.SM }}
                oneLiner={true}
                titleProps={{ variant: 'buttonM' }}
              />
            </Button>
          ) : (
            <ConnectWalletButton />
          )}

          <Box sx={{ display: { xs: 'none', mdlg: 'block' } }}>{!mdlg && <SettingsMenu />}</Box>

          <Box sx={{ display: { xs: 'flex', mdlg: 'none' } }}>
            <MobileMenu
              open={mobileDrawerOpen && mdlg}
              setOpen={setMobileDrawerOpen}
              headerHeight={headerHeight}
            />
          </Box>
        </Container>
      </Box>
    </HideOnScroll>
  );
}
