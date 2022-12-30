import Box from '@mui/material/Box';
import * as React from 'react';

import { FooterNavItems } from './components/FooterNavItems';

export function AppFooter() {
  return (
    <Box
      sx={(theme) => ({
        height: { md: 60, sm: 70 },
        position: 'fixed',
        width: '100%',
        bottom: 0,
        // transition: theme.transitions.create('top'),
        zIndex: 9999999,
        bgcolor: theme.palette.background.default,
        // padding: {
        //   xs: mobileMenuOpen || walletWidgetOpen ? '8px 20px' : '8px 8px 8px 20px',
        //   xsm: '8px 20px',
        // },
        padding: {
          //   xs: '10px 20px',
          //   sm: 0,
        },
        pt: {
          //   sm: 0,
          //   md: 4,
        },
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'space-between',
        boxShadow: 'inset 0px 1px 0px rgba(0, 0, 0, 0.04)',
        // background: theme.palette.background.default,
      })}
    >
      <FooterNavItems />
    </Box>
  );
}
