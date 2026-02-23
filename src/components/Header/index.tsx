import { AccountCircleSharp, SwapHorizOutlined } from '@mui/icons-material';
import { Box, Button, Tab } from '@mui/material';
import Image from 'next/image';
import MaxWidthContainer from 'src/components/MaxWidthContainer';

import { Container, IconButton, Tabs } from './styles';

export default function Header() {
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
            <Button variant="outlined" startIcon={<AccountCircleSharp />}>
              0x56...6810
            </Button>
            <IconButton>
              <AccountCircleSharp />
            </IconButton>
          </Box>
        </Box>
      </MaxWidthContainer>
    </Container>
  );
}
