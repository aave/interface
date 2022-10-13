import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Button, SvgIcon, Typography } from '@mui/material';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { DarkTooltip } from './infoTooltips/DarkTooltip';
import { Link, ROUTES } from './primitives/Link';

export const FaucetButton = () => {
  const { currentNetworkConfig } = useProtocolDataContext();

  return (
    <DarkTooltip title="Get free assets to test the Aave Protocol">
      <Button
        startIcon={
          <img
            src={currentNetworkConfig.networkLogoPath}
            alt={currentNetworkConfig.name}
            style={{ width: 14, height: 14 }}
          />
        }
        endIcon={
          <SvgIcon sx={{ width: 14, height: 14 }}>
            <ExternalLinkIcon />
          </SvgIcon>
        }
        component={Link}
        href={ROUTES.faucet}
        variant="outlined"
        size="small"
      >
        <Typography variant="buttonS">
          <Trans>{currentNetworkConfig.name} Faucet</Trans>
        </Typography>
      </Button>
    </DarkTooltip>
  );
};
