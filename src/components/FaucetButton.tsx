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
      <Button component={Link} href={ROUTES.faucet} variant="outlined" size="small">
        <img
          src={currentNetworkConfig.networkLogoPath}
          alt={currentNetworkConfig.name}
          style={{ width: 14, height: 14 }}
        />
        <Typography sx={{ mx: 1 }} variant="buttonS">
          <Trans>{currentNetworkConfig.name} Faucet</Trans>
        </Typography>
        <SvgIcon sx={{ fontSize: 14 }}>
          <ExternalLinkIcon />
        </SvgIcon>
      </Button>
    </DarkTooltip>
  );
};
