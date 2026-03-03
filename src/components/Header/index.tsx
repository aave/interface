import { AccountCircleSharp, Settings, SwapHorizOutlined } from '@mui/icons-material';
import { Box, Button, Tab } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { WALLET_ADDRESS } from 'src/components/Modals/const';
import SettingsMenu from 'src/components/Modals/SettingsMenu';
import { ModalType } from 'src/components/Modals/types';
import { useModalStore } from 'src/store/useModalStore';

import { Container, IconButton, Tabs } from './styles';

export default function Header() {
  const openModal = useModalStore((s) => s.openModal);
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);

  return (
    <Container>
      <MaxWidthContainer>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Image src="/logo.svg" width={120} height={18} alt="logo" />
          <Tabs value={0}>
            <Tab label="Dashboard" />
            <Tab label="Markets" />
            <Tab label="FAQ" />
          </Tabs>
          <Box display="flex" gap={1}>
            <Button variant="outlined" endIcon={<SwapHorizOutlined />}>
              Swap
            </Button>
            <Button
              variant="outlined"
              startIcon={<AccountCircleSharp />}
              onClick={() => openModal(ModalType.Wallet, { address: WALLET_ADDRESS })}
            >
              0x56...6810
            </Button>
            <IconButton onClick={(e) => setSettingsAnchor(e.currentTarget)}>
              <Settings />
            </IconButton>
            <SettingsMenu anchorEl={settingsAnchor} onClose={() => setSettingsAnchor(null)} />
          </Box>
        </Box>
      </MaxWidthContainer>
    </Container>
  );
}
