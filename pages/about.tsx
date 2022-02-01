import { Trans } from '@lingui/macro';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import * as React from 'react';

import { Link } from '../src/components/primitives/Link';
import { MainLayout } from '../src/layouts/MainLayout';

export default function About() {
  return (
    <Container maxWidth="xl">
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
          <Button variant="contained">
            <Trans>Open Modal</Trans>
          </Button>
        </Box>
        <Box maxWidth="sm" sx={{ mt: 5 }}>
          <Button variant="contained">
            <Trans>Open Supply Modal</Trans>
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

About.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout headerTopLineHeight={10}>{page}</MainLayout>;
};
