import { Trans } from '@lingui/macro';
import { Paper, Typography } from '@mui/material';
import React from 'react';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';
import { useLeverageContext } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';

import DeltaHedgedStrategy from './components/DeltaHedgedStrategy';
import LeverageSlider from './components/LeverageSlider';
import SelectCollateralAsset from './components/SelectCollateralAsset';
import { collateralAssetsType } from './utils/leverageActionHelper';

const LeverageContainer = () => {
  const { collateralAssets, assetsLoading, leverage } = useLeverageContext();
  const [currentCollateral, setCurrentCollateral] = React.useState<collateralAssetsType | null>(
    null
  );
  const [amount, setAmount] = React.useState<string>('');
  React.useEffect(() => {
    setCurrentCollateral(collateralAssets.filter((asset) => asset['token'] === 'sGLP')[0]);
  }, [assetsLoading]);
  if (assetsLoading || !currentCollateral) return <ManekiLoadingPaper />;
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
      <SelectCollateralAsset {...{ amount, setAmount, currentCollateral, setCurrentCollateral }} />
      <SectionText>
        <Trans>Delta Hedged Strategy</Trans>
      </SectionText>
      <DeltaHedgedStrategy />
      <SectionText>
        <Trans>Leverage: {leverage}x</Trans>
      </SectionText>
      <LeverageSlider />
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
