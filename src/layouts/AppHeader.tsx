import { useLingui } from '@lingui/react';
import { Button, List, ListItem } from '@mui/material';
import Box from '@mui/material/Box';
import dynamic from 'next/dynamic';
import * as React from 'react';

import { Link } from '../components/Link';
import { useProtocolDataContext } from '../hooks/useProtocolData';
import { navigation } from '../ui-config/menu-items';
import { uiConfig } from '../uiConfig';
import { MoreMenu } from './MoreMenu';
import { SettingsMenu } from './SettingsMenu';

const WalletWidget = dynamic(() => import('./WalletWidget'), {
  ssr: false,
});

interface AppHeaderProps {
  topLineHeight: number;
}

export function AppHeader({ topLineHeight }: AppHeaderProps) {
  const { i18n } = useLingui();
  const { currentMarketData } = useProtocolDataContext();
  const headerHeight = 48;

  return (
    <>
      <Box
        component="header"
        sx={(theme) => ({
          height: headerHeight,
          position: 'sticky',
          top: 0,
          transition: theme.transitions.create('top'),
          zIndex: theme.zIndex.appBar,
          bgcolor: 'background.header',
          p: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'space-between',
          boxShadow: 'inset 0px -1px 0px rgba(255, 255, 255, 0.12)',
        })}
      >
        <Box
          component={Link}
          href="/"
          aria-label="Go to homepage"
          sx={{ lineHeight: 0, mr: 7, transition: '0.3s ease all', '&:hover': { opacity: 0.7 } }}
        >
          <img src={uiConfig.appLogo} alt="An SVG of an eye" height={20} />
        </Box>

        <List sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center' }} disablePadding>
          {navigation.map((item, index) => (
            <ListItem
              sx={{
                display:
                  !!item.isVisible && !item.isVisible(currentMarketData) ? 'none' : 'inline-flex',
                width: 'unset',
                mr: 2,
              }}
              data-cy={item.dataCy}
              disablePadding
              key={index}
            >
              <Button
                component={Link}
                href={item.link}
                sx={{
                  color: 'common.white',
                  p: '6px 8px',
                  '&:hover': {
                    bgcolor: 'rgba(250, 251, 252, 0.08)',
                  },
                }}
              >
                {i18n._(item.title)}
              </Button>
            </ListItem>
          ))}

          <ListItem sx={{ width: 'unset' }} disablePadding>
            <MoreMenu />
          </ListItem>
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <WalletWidget />
        <SettingsMenu />
      </Box>

      <Box
        sx={{
          position: 'absolute',
          top: headerHeight,
          left: 0,
          zIndex: -1,
          width: '100%',
          height: `${topLineHeight}px`,
          bgcolor: '#090815',
          transition: 'all 0.2s ease-in-out',
        }}
      />
    </>
  );
}
