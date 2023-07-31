import { Trans } from '@lingui/macro';
import { Paper, Typography } from '@mui/material';
// import { BigNumber } from 'ethers';
import React from 'react';
import { ConnectWalletPaper } from 'src/components/ConnectWalletPaper';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';
import { useLeverageContext } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';
import { marketsData } from 'src/ui-config/marketsConfig';

import ChooseBorrowedAssets from './components/ChooseBorrowedAssets';
import DeltaHedgedStrategy from './components/DeltaHedgedStrategy';
import LeverageActionButton from './components/LeverageActionButton';
import LeverageInfoDisplay from './components/LeverageInfoDisplay';
import LeverageSlider from './components/LeverageSlider';
import LeverageSnackbar from './components/LeverageSnackbar';
import SelectCollateralAsset from './components/SelectCollateralAsset';

const LeverageContainer = () => {
  const { currentAccount, chainId } = useWeb3Context();
  const { assetsLoading, leverage, currentCollateral } = useLeverageContext();
  const requiredChainId = marketsData.arbitrum_mainnet_v3.chainId;
  const [amount, setAmount] = React.useState<string>('');

  if (!currentAccount)
    return <ConnectWalletPaper description={'Please connect your wallet to procceed.'} />;
  if (chainId !== requiredChainId)
    return <ManekiLoadingPaper description={'Connected to the wrong network.'} switchNetwork />;
  if (assetsLoading || currentCollateral.token === '')
    return <ManekiLoadingPaper description="Getting Assets..." withCircle />;
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
        {/* START HERE */}
        <Trans>Choose Borrowed Assets</Trans>
      </SectionText>
      <ChooseBorrowedAssets />
      <SectionText>
        <Trans>Delta Hedged Strategy</Trans>
      </SectionText>
      <DeltaHedgedStrategy />
      {/* END HERE */}
      <SectionText>
        <Trans>Leverage: {leverage}x</Trans>
      </SectionText>
      <LeverageSlider />
      <LeverageInfoDisplay amount={amount} />
      <LeverageActionButton amount={amount} />
      <LeverageSnackbar />
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
