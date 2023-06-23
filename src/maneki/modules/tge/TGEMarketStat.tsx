import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { utils } from 'ethers';
import TGECylinderIcon from 'public/icons/maneki/tge-cylinder-icon.svg';
import * as React from 'react';
import { useTGEContext } from 'src/maneki/hooks/tge-data-provider/TGEDataProvider';

const TGEMarketStat = () => {
  const { finalPAWPrice } = useTGEContext();
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
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '20px',
        gap: '8px',
        width: { xs: '100%', xsm: '296px' },
        backgroundColor: theme.palette.mode === 'dark' ? 'background.paper' : 'background.default',
        borderRadius: '8px',
      })}
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
