import { Trans } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Button, List, ListItem, Typography, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { useRootStore } from 'src/store/root';
import { NAV_BAR } from 'src/utils/events';
import { figmaDark } from 'src/utils/figmaColors';
import { useShallow } from 'zustand/shallow';

import { Link, ROUTES } from '../../components/primitives/Link';
import { navigation } from '../../ui-config/menu-items';
import { navLinkSx } from './navLinkSx';
import { StakingMenu } from './StakingMenu';

interface NavItemsProps {
  setOpen?: (value: boolean) => void;
}

export const NavItems = ({ setOpen }: NavItemsProps) => {
  const { i18n } = useLingui();
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));
  const [trackEvent, currentMarketData] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarketData])
  );
  const handleClick = (title: string, isMd: boolean) => {
    if (isMd && setOpen) {
      trackEvent(NAV_BAR.MAIN_MENU, { nav_link: title });
      setOpen(false);
    } else {
      trackEvent(NAV_BAR.MAIN_MENU, { nav_link: title });
    }
  };
  return (
    <List
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        flexDirection: { xs: 'column', md: 'row' },
      }}
      disablePadding
    >
      {navigation
        .filter((item) => !item.isVisible || item.isVisible(currentMarketData))
        .map((item, index) => (
          <ListItem
            sx={{
              width: { xs: '100%', md: 'unset' },
              mr: { xs: 0, md: 2 },
            }}
            data-cy={item.dataCy}
            disablePadding
            key={index}
          >
            {md ? (
              <Typography
                component={Link}
                href={item.link}
                variant="h2"
                color={figmaDark['fg-1']}
                sx={{ width: '100%', p: 4 }}
                onClick={() => handleClick(item.title, true)}
              >
                {i18n._(item.title)}
              </Typography>
            ) : (
              <Button
                component={Link}
                onClick={() => handleClick(item.title, false)}
                href={item.link}
                sx={(theme) => navLinkSx(theme, '2.25rem 0.88rem')}
              >
                {i18n._(item.title)}
              </Button>
            )}
          </ListItem>
        ))}

      <ListItem
        sx={{
          width: { xs: '100%', md: 'unset' },
          mr: { xs: 0, md: 2 },
        }}
        disablePadding
      >
        {md ? (
          <Typography
            component={Link}
            href={ROUTES.sGHO}
            variant="h2"
            color={figmaDark['fg-1']}
            sx={{ width: '100%', p: 4 }}
            onClick={() => handleClick('sGHO', true)}
          >
            <Trans>sGHO</Trans>
          </Typography>
        ) : (
          <Button
            component={Link}
            onClick={() => handleClick('sGHO', false)}
            href={ROUTES.sGHO}
            sx={(theme) => navLinkSx(theme, '1.5rem 0.5rem')}
          >
            <Trans>Savings</Trans>
          </Button>
        )}
      </ListItem>

      <ListItem
        sx={{
          width: { xs: '100%', md: 'unset' },
          mr: { xs: 0, md: 2 },
        }}
        disablePadding
      >
        {md ? (
          <>
            <Typography
              component={Link}
              href={ROUTES.staking}
              variant="h2"
              color={figmaDark['fg-1']}
              sx={{ width: '100%', p: 4 }}
              onClick={() => handleClick('Staking', true)}
            >
              <Trans>Staking</Trans>
            </Typography>
          </>
        ) : (
          <StakingMenu />
        )}
      </ListItem>

      {md && (
        <ListItem
          sx={{
            width: { xs: '100%', md: 'unset' },
            mr: { xs: 0, md: 2 },
          }}
          disablePadding
        >
          <Typography
            component={Link}
            href={ROUTES.safetyModule}
            variant="h2"
            color={figmaDark['fg-1']}
            sx={{ width: '100%', p: 4 }}
            onClick={() => handleClick('Safety Module', true)}
          >
            <Trans>Safety Module</Trans>
          </Typography>
        </ListItem>
      )}
    </List>
  );
};
