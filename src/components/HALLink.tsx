import { Trans } from '@lingui/macro';
import {
  Box,
  Popper,
  styled,
  SvgIcon,
  Tooltip,
  Typography,
  experimental_sx,
  Button,
  Link,
} from '@mui/material';
import { useMemo } from 'react';

import Hal from '/public/icons/healthFactor/HAL.svg';
import HalHover from '/public/icons/healthFactor/HALHover.svg';

import { useProtocolDataContext } from '../hooks/useProtocolDataContext';
import { useWeb3Context } from '../libs/hooks/useWeb3Context';
import { CustomMarket } from '../ui-config/marketsConfig';

const V2URL = 'https://app.hal.xyz/recipes/aave-track-your-health-factor';
const V3URL = 'https://app.hal.xyz/recipes/aave-v3-track-health-factor';

const PopperComponent = styled(Popper)(
  experimental_sx({
    '.MuiTooltip-tooltip': {
      color: 'text.primary',
      backgroundColor: 'background.paper',
      p: 0,
      borderRadius: '6px',
      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
      maxWidth: '200px',
    },
    '.MuiTooltip-arrow': {
      color: 'background.paper',
      '&:before': {
        boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
      },
    },
  })
);

const SvgIconStyle = {
  fontSize: '14px',
  zIndex: 2,
  position: 'absolute',
  left: 5,
  transition: 'all 0.2s easy',
};

interface HALIntegrationVars {
  URL: string;
  chain: string;
}

const marketToHALIntegrationVars = (market: CustomMarket): HALIntegrationVars | undefined => {
  const exhaustCases = (_: string) => undefined;

  switch (market) {
    // Supported V2 markets
    case CustomMarket.proto_polygon:
      return { URL: V2URL, chain: 'aavepolygon' };
    case CustomMarket.proto_avalanche:
      return { URL: V2URL, chain: 'aaveavalanche' };
    case CustomMarket.proto_mainnet:
      return { URL: V2URL, chain: 'aavev2' };

    // Supported V3 markets
    case CustomMarket.proto_fantom_v3:
      return { URL: V3URL, chain: 'fantom' };
    case CustomMarket.proto_avalanche_v3:
      return { URL: V3URL, chain: 'avalanche' };
    case CustomMarket.proto_polygon_v3:
      return { URL: V3URL, chain: 'polygon' };
    case CustomMarket.proto_arbitrum_v3:
      return { URL: V3URL, chain: 'arbitrum' };

    default:
      return exhaustCases(market);
  }
};

interface Props {
  healthFactor: number;
}

export default function HALLink({ healthFactor }: Props) {
  const { currentMarket } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const supportedIntegration = marketToHALIntegrationVars(currentMarket);

  const urlString = useMemo(() => {
    if (supportedIntegration === undefined) return '';

    const url = new URL(supportedIntegration.URL);
    url.searchParams.set('user', currentAccount);
    url.searchParams.set('healthfactor', healthFactor.toString());
    url.searchParams.set('chain', supportedIntegration.chain);
    url.searchParams.set('aaveversion', supportedIntegration.chain);

    return url.toString();
  }, [currentAccount, supportedIntegration, healthFactor]);

  // Do not show the HAL Noticiation icon for unsupported markets
  if (supportedIntegration === undefined) {
    return null;
  }

  return (
    <Tooltip
      title={
        <Box sx={{ py: 4, px: 6 }}>
          <Typography variant="tooltip" color="text.secondary">
            <Trans>Receive notifications about your Health Factor status using Hal app.</Trans>
          </Typography>
        </Box>
      }
      PopperComponent={PopperComponent}
      arrow
      placement="top"
    >
      <Button
        href={urlString}
        variant="surface"
        size="small"
        target="_blank"
        component={Link}
        sx={{
          pl: 6,
          mt: { xs: 1, xsm: 0 },
          ml: { xs: 0, xsm: 2 },
          position: 'relative',
          '&:hover': {
            '.HALTooltip__icon': { opacity: 0 },
            '.HALTooltip__hoverIcon': { opacity: 1 },
          },
        }}
      >
        <SvgIcon sx={{ opacity: 1, ...SvgIconStyle }} className="HALTooltip__icon">
          <Hal />
        </SvgIcon>
        <SvgIcon sx={{ opacity: 0, ...SvgIconStyle }} className="HALTooltip__hoverIcon">
          <HalHover />
        </SvgIcon>
        <Trans>Notify</Trans>
      </Button>
    </Tooltip>
  );
}
