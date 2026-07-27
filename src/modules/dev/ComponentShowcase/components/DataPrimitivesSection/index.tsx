import { Box } from '@mui/material';
import { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import {
  DetailsCollateralLine,
  DetailsCooldownLine,
  DetailsHFLine,
  DetailsNumberLine,
  DetailsNumberLineWithSub,
  DetailsTextLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { CollateralType } from 'src/helpers/types';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const TOKENS = ['AAVE', 'ETH', 'USDC', 'DAI', 'GHO', 'WBTC'];

const UnwrapDemo = () => {
  const [unwrapped, setUnwrapped] = useState(false);
  return (
    <DetailsUnwrapSwitch unwrapped={unwrapped} setUnWrapped={setUnwrapped} label="Unwrap WETH" />
  );
};

export const DataPrimitivesSection = () => (
  <Section title="Data primitives">
    <Specimen label="FormattedNumber (plain / USD / percent / compact / sub-min / token)" fullWidth>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormattedNumber value={1234.5678} variant="h4" />
        <FormattedNumber value={1234.56} symbol="USD" variant="h4" />
        <FormattedNumber value={0.0725} percent variant="h4" />
        <FormattedNumber value={1234567} compact variant="h4" />
        <FormattedNumber value={0.0000001} variant="h4" />
        <FormattedNumber value={12.5} symbol="AAVE" variant="h4" />
      </Box>
    </Specimen>

    <Specimen label="TokenIcon — single / aToken / waToken / multi">
      {TOKENS.map((symbol) => (
        <TokenIcon key={symbol} symbol={symbol} sx={{ fontSize: '32px' }} />
      ))}
      <TokenIcon symbol="USDC" aToken sx={{ fontSize: '32px' }} />
      <TokenIcon symbol="USDC" waToken sx={{ fontSize: '32px' }} />
      <TokenIcon symbol="AAVE_ETH" sx={{ fontSize: '32px' }} />
    </Specimen>

    <Specimen label="Row" fullWidth>
      <Box sx={{ width: '100%' }}>
        <Row caption="Wallet balance">
          <FormattedNumber value={12.5} symbol="AAVE" variant="h5" />
        </Row>
      </Box>
    </Specimen>

    <Specimen label="Details*Line family (transaction overview rows)" fullWidth>
      <Box sx={{ width: '100%', maxWidth: 480 }}>
        <TxModalDetails showGasStation={false}>
          <DetailsNumberLine
            description="Amount"
            value={1234.56}
            iconSymbol="AAVE"
            futureValue={1300}
          />
          <DetailsNumberLineWithSub
            description="Supply balance"
            symbol="AAVE"
            value="10"
            valueUSD="1000"
            futureValue="12"
            futureValueUSD="1200"
            tokenIcon="AAVE"
          />
          <DetailsHFLine healthFactor="1.85" futureHealthFactor="1.42" visibleHfChange />
          <DetailsCollateralLine collateralType={CollateralType.ENABLED} />
          <DetailsCooldownLine cooldownSeconds={172800} />
          <DetailsTextLine description="Network" text="Ethereum" />
          <UnwrapDemo />
        </TxModalDetails>
      </Box>
    </Specimen>
  </Section>
);
