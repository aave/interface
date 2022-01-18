import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { Button } from '@mui/material';
import { Link } from '../components/Link';
import MoreMenu from './MoreMenu';
import { uiConfig } from '../uiConfig';
import WalletWidget from './WalletWidget';
import ConnectWalletWidget from './ConnectWalletWidget';


const Header = styled('header')(({ theme }) => ({
  position: 'sticky',
  top: 0,
  transition: theme.transitions.create('top'),
  zIndex: theme.zIndex.appBar,
  backdropFilter: 'blur(20px)',
  boxShadow: `inset 0px -1px 1px ${
    theme.palette.mode === 'dark' ? theme.palette.primaryDark[700] : theme.palette.grey[100]
  }`,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? alpha(theme.palette.primaryDark[900], 0.72)
      : 'rgba(255,255,255,0.72)',
}));

export default function AppHeader() {
  return (
    <Header>
      <Container maxWidth="xl" sx={{ display: 'flex', alignItems: 'center', height: 48 }}>
        <Box
          component={Link}
          href={'/'}
          aria-label="Go to homepage"
          sx={{ lineHeight: 0, mr: 2, display: 'flex' }}
        >
          <img src={uiConfig.appLogo} alt="An SVG of an eye" height={20} />
        </Box>
        <Box
          sx={{
            display: { xs: 'none', sm: 'initial' },
            mr: '12px',
          }}
        >
          <Button size="small" color="inherit">
            Markets
          </Button>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'initial' }, mr: '12px' }}>
          <Button size="small" color="inherit">
            Dashboard
          </Button>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'initial' }, mr: '12px' }}>
          <Button size="small" color="inherit">
            Stake
          </Button>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'initial' }, mr: '12px' }}>
          <Button size="small" color="inherit">
            Governance
          </Button>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <WalletWidget />
        <MoreMenu />
        <ConnectWalletWidget />
      </Container>
    </Header>
  );
}
