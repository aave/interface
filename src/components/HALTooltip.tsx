import { Trans } from '@lingui/macro';
import { Box, Popper, styled, SvgIcon, Tooltip, Typography } from '@mui/material';
import sx from '@mui/system/sx';
import { useMemo } from 'react';

import Hal from '/public/icons/healthFactor/HAL.svg';
import HalHover from '/public/icons/healthFactor/HALHover.svg';

import { useProtocolDataContext } from '../hooks/useProtocolDataContext';
import { useWeb3Context } from '../libs/hooks/useWeb3Context';
import { CustomMarket } from '../ui-config/marketsConfig';
import { Link } from './primitives/Link';

const PopperComponent = styled(Popper)(
  sx({
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

const marketToHALAaveVersionUrlParam = (market: CustomMarket): string | undefined => {
  const exhaustCases = (_: string) => undefined;

  switch (market) {
    case CustomMarket.proto_polygon:
      return 'aavepolygon';
    case CustomMarket.proto_avalanche:
      return 'aaveavalanche';
    case CustomMarket.proto_mainnet:
      return 'aavev2';

    case CustomMarket.proto_kovan:
    case CustomMarket.proto_mumbai:
    case CustomMarket.proto_fuji:
    case CustomMarket.amm_kovan:
    case CustomMarket.amm_mainnet:
      return undefined;

    default:
      return exhaustCases(market);
  }
};

export default function HALTooltip({}) {
  const { currentMarket } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const supportedAaveVersion = marketToHALAaveVersionUrlParam(currentMarket);
  const urlString = useMemo(() => {
    const url = new URL('https://9000.hal.xyz/recipes/aave-track-your-health-factor');
    url.searchParams.set('user', currentAccount);

    const aaveVersionParam = supportedAaveVersion;
    if (aaveVersionParam !== undefined) {
      url.searchParams.set('aaveversion', aaveVersionParam);
    }

    return url.toString();
  }, [currentAccount, supportedAaveVersion]);

  // Do not show the HAL Noticiation icon on unsupported markets.
  if (supportedAaveVersion === undefined) {
    return null;
  }

  return (
    <Tooltip
      title={
        <Box sx={{ py: 4, px: 6 }}>
          <Typography variant="tooltip" color="text.secondary">
            <Trans>
              Setup triggers and receive notifications about your Health Factor status using Hal
              app.
            </Trans>
          </Typography>
        </Box>
      }
      PopperComponent={PopperComponent}
      arrow
      placement="top"
    >
      <Link
        href={urlString}
        ml={1}
        sx={{
          position: 'relative',
          '&:hover': {
            '.HALTooltip__icon': { opacity: 0 },
            '.HALTooltip__hoverIcon': { opacity: 1 },
          },
        }}
      >
        <SvgIcon
          sx={{ fontSize: '16px', transition: 'all 0.2s easy' }}
          className="HALTooltip__icon"
        >
          <Hal />
        </SvgIcon>
        <SvgIcon
          sx={{
            fontSize: '16px',
            opacity: 0,
            zIndex: 2,
            position: 'absolute',
            left: 0,
            transition: 'all 0.2s easy',
          }}
          className="HALTooltip__hoverIcon"
        >
          <HalHover />
        </SvgIcon>
      </Link>
    </Tooltip>
  );
}
