import { Trans } from '@lingui/macro';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import type { NextPage } from 'next';
import * as React from 'react';

import FormattedNumber from '../src/components/FormattedNumber';
import { Link } from '../src/components/Link';
import { MultiTokenIcon } from '../src/components/TokenIcon';
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
        <MultiTokenIcon symbols={['aave', 'usdc', 'usdt']} badgeSymbol="bal" fontSize="large" />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <FormattedNumber value={0.00000000000000000001} symbol="AAVE" />
        <FormattedNumber value={0.00000000000000000001} symbol="USD" />
        <FormattedNumber value={0.00000000000000000001} symbol="USD" compact />
        <FormattedNumber value={28882.17271916622} symbol="USD" />
        <FormattedNumber value={28882.17271916622} symbol="USDT" compact maximumDecimals={2} />
        <FormattedNumber
          value={'288829192763715.17271916622'}
          symbol="DAI"
          sx={{ fontWeight: 500 }}
        />
        <FormattedNumber value={0.213133212312} percent />
      </Box>
    </Container>
  );
};

export default Home;
