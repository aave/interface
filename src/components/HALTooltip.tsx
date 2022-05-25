import { Trans } from '@lingui/macro';
import { Box, Popper, styled, SvgIcon, Tooltip, Typography, experimental_sx } from '@mui/material';
import { useMemo } from 'react';

import Hal from '/public/icons/healthFactor/HAL.svg';
import HalHover from '/public/icons/healthFactor/HALHover.svg';
import { useWeb3Context } from '../libs/hooks/useWeb3Context';
import { Link } from './primitives/Link';

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

export default function HALTooltip({ halMarketName }: { halMarketName: string }) {
  const { currentAccount } = useWeb3Context();

  const urlString = useMemo(() => {
    const url = new URL('https://9000.hal.xyz/recipes/aave-track-your-health-factor');
    url.searchParams.set('user', currentAccount);
    url.searchParams.set('aaveversion', halMarketName);

    return url.toString();
  }, [currentAccount, halMarketName]);

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
