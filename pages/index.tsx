import { Trans } from '@lingui/macro';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Supply } from 'src/components/Supply/Supply';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';

import { FormattedNumber } from '../src/components/FormattedNumber';
import { Link } from '../src/components/Link';
import { MultiTokenIcon } from '../src/components/TokenIcon';
import MainLayout from '../src/layouts/MainLayout';
// import { useProtocolDataContext } from '../src/hooks/useProtocolData';

export default function Home() {
  // const { currentMarket } = useProtocolDataContext();
  const { walletBalances } = useWalletBalances();
  const { reserves, user } = useAppDataContext();

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
      <Box>
        {reserves.map((reserve, index) => {
          return (
            <div key={index}>
              {reserve.symbol} {walletBalances[reserve.underlyingAsset]?.amountUSD}
              {user && (
                <Supply
                  poolReserve={reserve}
                  walletBalance={walletBalances[reserve.underlyingAsset]?.amount}
                  user={user}
                  supplyApy={reserve.supplyAPY}
                ></Supply>
              )}
            </div>
          );
        })}
      </Box>
    </Container>
  );
}

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout headerTopLineHeight={248}>{page}</MainLayout>;
};
