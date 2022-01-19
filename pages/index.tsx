import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link } from '../src/components/Link';
import { Trans } from '@lingui/macro';
import { TokenIcon } from 'src/components/TokenIcon';
// import { useProtocolDataContext } from '../src/hooks/useProtocolData';

const Home: NextPage = () => {
  // const { currentMarket } = useProtocolDataContext();
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
          <Trans>Welcome to Aave UI</Trans>
        </Typography>
        <Link href="/about" color="secondary">
          <Trans>Go to About page</Trans>
        </Link>
        <TokenIcon symbol="aave" />
        <TokenIcon symbol="aave" aToken />
      </Box>
    </Container>
  );
};

export default Home;
