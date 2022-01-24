import { Trans } from '@lingui/macro';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import { AaveModal } from '../src/components/AaveModal/AaveModal';
import { useAaveModal } from '../src/components/AaveModal/useAaveModal';
import { Link } from '../src/components/primitives/Link';
import { SupplyFlowModal } from '../src/flows/SupplyFlowModal/SupplyFlowModal';
import { MainLayout } from '../src/layouts/MainLayout';

export default function About() {
  const [open, setOpen] = useAaveModal(false);
  const [open2, setOpen2] = useAaveModal(false);
  const args = {
    tokenAddress: true,
    supplyRewards: [{ tokenName: 'stkAAVE', tokenIcon: 'aave', apy: '6.78' }],
    supplyApy: '4.6',
    healthFactor: '3.2',
    balance: '12340',
    tokenSymbol: 'dai',
  };
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          <Trans>About the app</Trans>
        </Typography>
        <Box maxWidth="sm">
          <Button variant="contained" component={Link} noLinkStyle href="/">
            <Trans>Go to Home page</Trans>
          </Button>
        </Box>
        <Box maxWidth="sm" sx={{ mt: 5 }}>
          <Button variant="contained" onClick={() => setOpen(true)}>
            <Trans>Open Modal</Trans>
          </Button>
        </Box>
        <Box maxWidth="sm" sx={{ mt: 5 }}>
          <Button variant="contained" onClick={() => setOpen2(true)}>
            <Trans>Open Supply Modal</Trans>
          </Button>
        </Box>
        <AaveModal title="Sobre nosotros" open={open} onClose={() => setOpen(false)}>
          Contenido
        </AaveModal>
        <SupplyFlowModal open={open2} onClose={() => setOpen2(false)} {...args} />
      </Box>
    </Container>
  );
}

About.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout headerTopLineHeight={10}>{page}</MainLayout>;
};
