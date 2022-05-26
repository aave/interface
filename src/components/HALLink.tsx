import { valueToBigNumber } from '@aave/math-utils';
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
import BigNumber from 'bignumber.js';
import { useMemo } from 'react';

import Hal from '/public/icons/healthFactor/HAL.svg';
import HalHover from '/public/icons/healthFactor/HALHover.svg';

import { useWeb3Context } from '../libs/hooks/useWeb3Context';

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

interface Props {
  healthFactor: string;
  marketName: string;
  integrationURL: string;
}

export default function HALLink({ healthFactor, marketName, integrationURL }: Props) {
  const { currentAccount } = useWeb3Context();

  const urlString = useMemo(() => {
    const formattedHealthFactor = valueToBigNumber(healthFactor).toFixed(2, BigNumber.ROUND_DOWN);

    const url = new URL(integrationURL);
    url.searchParams.set('user', currentAccount);
    url.searchParams.set('healthfactor', formattedHealthFactor);
    url.searchParams.set('chain', marketName);
    url.searchParams.set('aaveversion', marketName);
    url.searchParams.set('utm_source', 'aave-integration');

    return url.toString();
  }, [currentAccount, healthFactor, marketName, integrationURL]);

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
