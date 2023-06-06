import { Box } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import * as React from 'react';
import { TopInfoPanelItem } from 'src/components/TopInfoPanel/TopInfoPanelItem';
import EARLY_TOKEN_GENERATION_ABI from 'src/maneki/abi/earlyTokenGenerationABI';
import ManekiLoadingPaper from 'src/maneki/components/ManekiLoadingPaper';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';

const TGEMarketStat = () => {
  const { provider } = useWeb3Context();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [finalPAWPrice, setFinalPAWPrice] = React.useState<BigNumber>(BigNumber.from(-1));
  const EARLY_TOKEN_GENERATION_ADDR = marketsData.bsc_testnet_v3.addresses
    .EARLY_TOKEN_GENERATION as string;
  React.useEffect(() => {
    const contract = new Contract(
      EARLY_TOKEN_GENERATION_ADDR,
      EARLY_TOKEN_GENERATION_ABI,
      provider
    );
    const promises = [];

    promises.push(contract.salesPrice());
    Promise.all(promises).then((data: BigNumber[]) => {
      setFinalPAWPrice(data[0]);
      setLoading(false);
    });
  }, []);

  if (loading) return <ManekiLoadingPaper description="Loading..." withCircle />;
  return (
    <Box>
      <TopInfoPanelItem title={'TGE PAW PRICE'}>
        {utils.formatUnits(finalPAWPrice, 18)}
      </TopInfoPanelItem>
      <TopInfoPanelItem title={'Market Cap'}>{'$5M'}</TopInfoPanelItem>
      <TopInfoPanelItem title={'Initial Supply / Total Supply'}>{'$2M / 100M'}</TopInfoPanelItem>
    </Box>
  );
};

export default TGEMarketStat;
