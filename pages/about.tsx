import { Trans } from '@lingui/macro';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import * as React from 'react';
import { AaveModal } from 'src/components/AaveModal/AaveModal';
import { useAaveModal } from 'src/components/AaveModal/useAaveModal';

import { Link } from '../src/components/Link';

const About: NextPage = () => {
  const [open, setOpen] = useAaveModal(true);

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
        <AaveModal title="Sobre nosotros" open={open} onClose={() => setOpen(false)}>
          Contenido
        </AaveModal>
      </Box>
    </Container>
  );
};

export default About;
