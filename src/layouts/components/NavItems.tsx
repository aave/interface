import { Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import {
  Box,
  Button,
  Collapse,
  List,
  ListItem,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import * as React from 'react';
import { ChevronDownIcon } from 'src/components/icons/ChevronDownIcon';
import { useRootStore } from 'src/store/root';
import { NAV_BAR } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { Link, ROUTES } from '../../components/primitives/Link';
import { navigation } from '../../ui-config/menu-items';
import { NAV_LINK_PADDING_X, NAV_LINK_PADDING_Y, navLinkSx } from './navLinkSx';
import { StakingMenu } from './StakingMenu';

interface NavItemsProps {
  setOpen?: (value: boolean) => void;
}

// Mobile drawer nav item: a 3rem-tall full-width row (desktop uses the Button branch instead).
// Horizontal inset comes from the scroll area's inner padding, so no left/right padding here.
const mobileNavItemSx = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  height: '3rem',
  borderRadius: '0.5rem',
};

// Active-route indicator: a purple bar flush to the drawer's left (screen) edge, vertically
// centred with the item. -0.75rem reaches past the scroll area's inner padding to the edge.
const activeBarSx = {
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '-0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '0.25rem',
    height: '2.5rem',
    borderRadius: '0 0.375rem 0.375rem 0',
    bgcolor: 'purple-1',
  },
};

// Wrapper for each nav ListItem: full-width in the mobile drawer, inline with a gap on desktop.
const navListItemSx = { width: { xs: '100%', mdlg: 'unset' }, mr: { xs: 0, mdlg: 2 } };

// A single mobile drawer nav link — top-level items and the Staking accordion's children all render
// through here (children pass `indent`).
const MobileNavLink = ({
  href,
  label,
  active,
  indent = false,
  onClick,
}: {
  href: string;
  label: React.ReactNode;
  active: boolean;
  indent?: boolean;
  onClick: () => void;
}) => (
  <Typography
    component={Link}
    href={href}
    variant="h3"
    color="fg-1"
    sx={[mobileNavItemSx, indent && { pl: '0.75rem' }, active && activeBarSx]}
    onClick={onClick}
  >
    {label}
  </Typography>
);

export const NavItems = ({ setOpen }: NavItemsProps) => {
  const { i18n } = useLingui();
  const { breakpoints } = useTheme();
  const mdlg = useMediaQuery(breakpoints.down('mdlg'));
  const router = useRouter();
  const [stakingOpen, setStakingOpen] = React.useState(false);
  const [trackEvent, currentMarketData, account] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarketData, store.account])
  );
  // Home ('/') renders the Dashboard when a wallet is connected, otherwise Markets — so light up
  // the matching nav item there, since an exact-path check alone never matches on the home route.
  const isActive = (href: string) => {
    if (router?.pathname === href) return true;
    if (router?.pathname === '/') {
      return account ? href === ROUTES.dashboard : href === ROUTES.markets;
    }
    return false;
  };
  const handleClick = (title: string, isMd: boolean) => {
    trackEvent(NAV_BAR.MAIN_MENU, { nav_link: title });
    if (isMd && setOpen) setOpen(false);
  };
  return (
    <List
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', mdlg: 'center' },
        flexDirection: { xs: 'column', mdlg: 'row' },
        gap: { xs: '0.5rem', mdlg: 0 },
      }}
      disablePadding
    >
      {navigation
        .filter((item) => !item.isVisible || item.isVisible(currentMarketData))
        .map((item, index) => (
          <ListItem sx={navListItemSx} data-cy={item.dataCy} disablePadding key={index}>
            {mdlg ? (
              <MobileNavLink
                href={item.link}
                label={i18n._(item.title)}
                active={isActive(item.link)}
                onClick={() => handleClick(item.title, true)}
              />
            ) : (
              <Button
                component={Link}
                className={isActive(item.link) ? 'active' : undefined}
                onClick={() => handleClick(item.title, false)}
                href={item.link}
                sx={navLinkSx(NAV_LINK_PADDING_Y, NAV_LINK_PADDING_X)}
              >
                {i18n._(item.title)}
              </Button>
            )}
          </ListItem>
        ))}

      <ListItem sx={navListItemSx} disablePadding>
        {mdlg ? (
          <MobileNavLink
            href={ROUTES.sGHO}
            label={<Trans>sGHO</Trans>}
            active={isActive(ROUTES.sGHO)}
            onClick={() => handleClick('sGHO', true)}
          />
        ) : (
          <Button
            component={Link}
            className={isActive(ROUTES.sGHO) ? 'active' : undefined}
            onClick={() => handleClick('sGHO', false)}
            href={ROUTES.sGHO}
            sx={navLinkSx(NAV_LINK_PADDING_Y, NAV_LINK_PADDING_X)}
          >
            <Trans>Savings</Trans>
          </Button>
        )}
      </ListItem>

      <ListItem
        sx={{
          ...navListItemSx,
          flexDirection: { xs: 'column', mdlg: 'row' },
          alignItems: { xs: 'stretch', mdlg: 'center' },
        }}
        disablePadding
      >
        {mdlg ? (
          <>
            <Box
              onClick={() => setStakingOpen((v) => !v)}
              sx={[
                mobileNavItemSx,
                { cursor: 'pointer', justifyContent: 'space-between' },
                !stakingOpen &&
                  (isActive(ROUTES.staking) || isActive(ROUTES.safetyModule)) &&
                  activeBarSx,
              ]}
            >
              <Typography variant="h3" color="fg-1">
                <Trans>Staking</Trans>
              </Typography>
              <SvgIcon
                sx={{
                  fontSize: 18,
                  color: 'fg-2',
                  transform: stakingOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              >
                <ChevronDownIcon />
              </SvgIcon>
            </Box>
            <Collapse in={stakingOpen} sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', pt: '0.5rem' }}>
                <MobileNavLink
                  href={ROUTES.staking}
                  label={<Trans>Umbrella</Trans>}
                  active={isActive(ROUTES.staking)}
                  indent
                  onClick={() => handleClick('Staking', true)}
                />
                <MobileNavLink
                  href={ROUTES.safetyModule}
                  label={<Trans>Safety Module</Trans>}
                  active={isActive(ROUTES.safetyModule)}
                  indent
                  onClick={() => handleClick('Safety Module', true)}
                />
              </Box>
            </Collapse>
          </>
        ) : (
          <StakingMenu />
        )}
      </ListItem>
    </List>
  );
};
