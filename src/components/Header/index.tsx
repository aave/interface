import { AccountCircleSharp, Menu as MenuIcon, Settings } from '@mui/icons-material';
import { Box, Button, Menu, MenuItem, IconButton as MuiIconButton, Tab } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { WALLET_ADDRESS } from 'src/components/Modals/const';
import SettingsMenu from 'src/components/Modals/SettingsMenu';
import { ModalType } from 'src/components/Modals/types';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { useDevice } from 'src/hooks';
import { useModalStore } from 'src/store/useModalStore';

import { Container, IconButton, MobileMenuButton, Tabs, TabsWrapper } from './styles';

const TABS = [
  { label: 'Dashboard', href: ROUTES.dashboard },
  { label: 'Markets', href: ROUTES.markets },
  { label: 'FAQ', href: ROUTES.faq },
];

export default function Header() {
  const router = useRouter();
  const openModal = useModalStore((s) => s.openModal);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<HTMLElement | null>(null);
  const pathname = (router.pathname || router.asPath || '').replace(/\/$/, '') || '/';
  const currentTab = TABS.findIndex((tab) => {
    const tabPath = tab.href.replace(/\/$/, '') || '/';
    return pathname === tabPath || (tabPath !== '/' && pathname.startsWith(tabPath + '/'));
  });

  const { isMobile } = useDevice();

  return (
    <Container>
      <MaxWidthContainer>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Link href={ROUTES.dashboard} noLinkStyle>
            <Image src="/logo.svg" width={120} height={18} alt="logo" />
          </Link>
          <TabsWrapper>
            <Tabs value={currentTab >= 0 ? currentTab : 0}>
              {TABS.map((tab) => (
                <Tab
                  key={tab.href}
                  label={tab.label}
                  component={Link}
                  href={tab.href}
                  noLinkStyle
                />
              ))}
            </Tabs>
          </TabsWrapper>

          <Box display="flex" gap={1}>
            {/* <Button variant="outlined" endIcon={<SwapHorizOutlined />}>
              Swap
            </Button> */}
            <Button
              variant="outlined"
              startIcon={<AccountCircleSharp />}
              onClick={() => openModal(ModalType.Wallet, { address: WALLET_ADDRESS })}
            >
              0x56...6810
            </Button>
            {isMobile ? (
              <MobileMenuButton>
                <MuiIconButton
                  onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
                  color="inherit"
                  aria-label="menu"
                >
                  <MenuIcon />
                </MuiIconButton>
                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={Boolean(mobileMenuAnchor)}
                  onClose={() => setMobileMenuAnchor(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                >
                  {TABS.map((tab) => (
                    <MenuItem
                      key={tab.href}
                      component={Link}
                      href={tab.href}
                      noLinkStyle
                      onClick={() => setMobileMenuAnchor(null)}
                    >
                      {tab.label}
                    </MenuItem>
                  ))}
                </Menu>
              </MobileMenuButton>
            ) : (
              <IconButton onClick={(e) => setSettingsAnchor(e.currentTarget)}>
                <Settings />
              </IconButton>
            )}
            <SettingsMenu anchorEl={settingsAnchor} onClose={() => setSettingsAnchor(null)} />
          </Box>
        </Box>
      </MaxWidthContainer>
    </Container>
  );
}
