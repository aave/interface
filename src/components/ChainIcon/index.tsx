import { ChainId } from '@aave/contract-helpers';
import { Box } from '@mui/material';
import { ComponentType } from 'react';
import { figVars } from 'src/utils/figmaColors';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

const MainnetIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="20" height="20" style={{ fill: figVars['ethereum'] }} />
    <path
      d="M9.99847 3.18018L9.90698 3.49093V12.5075L9.99847 12.5988L14.1838 10.1248L9.99847 3.18018Z"
      fill="white"
    />
    <path d="M9.99816 3.18018L5.81274 10.1248L9.99816 12.5988V8.22238V3.18018Z" fill="white" />
    <path
      d="M9.99829 16.8179L5.81274 10.9204L9.99829 13.3931L14.1858 10.9204L9.99829 16.8179Z"
      fill="white"
    />
    <path d="M9.99805 12.5991L14.1834 10.1251L9.99805 8.22266V12.5991Z" fill="white" />
    <path d="M5.81274 10.1251L9.99816 12.5991V8.22266L5.81274 10.1251Z" fill="white" />
  </svg>
);

const CUSTOM_ICON: Partial<Record<ChainId, ComponentType>> = {
  [ChainId.mainnet]: MainnetIcon,
};

export const ChainIcon = ({ chainId, size = 16 }: { chainId: ChainId; size?: number | string }) => {
  const Icon = CUSTOM_ICON[chainId];

  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        overflow: 'hidden',
        borderRadius: '99rem',
        '& > svg, & > img': { display: 'block', width: '100%', height: '100%' },
      }}
    >
      {Icon ? <Icon /> : <img src={getNetworkConfig(chainId).networkLogoPath} alt="" />}
    </Box>
  );
};
