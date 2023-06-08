import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import TGECylinderIcon from 'public/icons/maneki/tge-cylinder-icon.svg';
import * as React from 'react';
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
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: { xs: 'column', xsm: 'row' },
        gap: { xs: 1, xsm: 8 },
        flexWrap: 'wrap',
        width: '100%',
        filter: 'drop-shadow(0px 4px 44px rgba(0, 0, 0, 0.1))',
        m: { xs: '36px 0px', xsm: '62px 0px' },
      }}
    >
      <TGEInfoPanelItem
        icon={<TGECylinderIcon />}
        title={<Trans>TGE PAW Price</Trans>}
        content={`${utils.formatUnits(finalPAWPrice, 18)} BNB`}
      />
      <TGEInfoPanelItem
        icon={<TGECylinderIcon />}
        title={<Trans>Market Cap</Trans>}
        content="$5M"
      />
      <TGEInfoPanelItem
        icon={<TGECylinderIcon />}
        title={<Trans>Initial Supply / Total Supply</Trans>}
        content="$2M / 100M"
      />
    </Box>
  );
};

interface TGEInfoPanelItemProps {
  icon?: React.ReactNode;
  title: React.ReactNode;
  content: string;
}

const TGEInfoPanelItem = ({ icon, title, content }: TGEInfoPanelItemProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '20px',
        gap: '8px',
        width: { xs: '100%', xsm: '296px' },
        backgroundColor: 'background.default',
        borderRadius: '8px',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
        {icon}
        <Typography
          variant="h4"
          sx={{
            fontWeight: '400',
            fontSize: { xs: '14px', xsm: '16px' },
            lineHeight: '24px',
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontWeight: '600',
          fontSize: '24px',
          lineHeight: '36px',
          ml: '12px',
        }}
      >
        {content}
      </Typography>
    </Box>
  );
};

export default TGEMarketStat;
