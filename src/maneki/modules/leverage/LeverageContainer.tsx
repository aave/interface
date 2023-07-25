import { Trans } from '@lingui/macro';
import { Paper, Typography } from '@mui/material';
import React from 'react';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';
import { useLeverageContext } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';

import ChooseBorrowedAssets from './components/ChooseBorrowedAssets';
import SelectCollateralAsset from './components/SelectCollateralAsset';
import { collateralAssetsType } from './utils/leverageActionHelper';

const LeverageContainer = () => {
  const { collateralAssets, assetsLoading } = useLeverageContext();
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
      <Typography variant="h2" sx={{ fontWeight: '700', lineHeight: '1.8', fontSize: '16px' }}>
        <Trans>Select Collateral Asset</Trans>
      </Typography>
      <SelectCollateralAsset {...{ amount, setAmount, currentCollateral, setCurrentCollateral }} />
      <Typography variant="h3" sx={{ fontWeight: '700', lineHeight: '1.8', fontSize: '16px' }}>
        <Trans>Choose Borrowed Assets</Trans>
      </Typography>
      <ChooseBorrowedAssets />
      <Typography variant="h3" sx={{ fontWeight: '700', lineHeight: '1.8', fontSize: '16px' }}>
        <Trans>Delta Hedged Strategy</Trans>
      </Typography>
    </Paper>
  );
};

export default LeverageContainer;
