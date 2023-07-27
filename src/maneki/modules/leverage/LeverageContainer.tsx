import { Trans } from '@lingui/macro';
import { Paper, Typography } from '@mui/material';
// import { BigNumber } from 'ethers';
import React from 'react';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';
import { useLeverageContext } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';

import DeltaHedgedStrategy from './components/DeltaHedgedStrategy';
import LeverageInfoDisplay from './components/LeverageInfoDisplay';
import LeverageSlider from './components/LeverageSlider';
import SelectCollateralAsset from './components/SelectCollateralAsset';

const LeverageContainer = () => {
  const { assetsLoading, leverage, currentCollateral } = useLeverageContext();
  const [amount, setAmount] = React.useState<string>('');
  if (assetsLoading || currentCollateral.token === '') return <ManekiLoadingPaper />;
  return (
    <Paper
      sx={{
        maxWidth: '600px',
        m: 'auto',
        width: '500px',
        padding: '32px 16px',
        borderRadius: '15px',
      }}
    >
      <SectionText>
        <Trans>Select Collateral Asset</Trans>
      </SectionText>
      <SelectCollateralAsset {...{ amount, setAmount }} />
      <SectionText>
        <Trans>Delta Hedged Strategy</Trans>
      </SectionText>
      <DeltaHedgedStrategy />
      <SectionText>
        <Trans>Leverage: {leverage}x</Trans>
      </SectionText>
      <LeverageSlider />
      <LeverageInfoDisplay amount={amount} />
    </Paper>
  );
};

function SectionText({ children }: { children: React.ReactElement }) {
  return (
    <Typography variant="h3" sx={{ fontWeight: '700', lineHeight: '1.8', fontSize: '16px' }}>
      {children}
    </Typography>
  );
}

export default LeverageContainer;
