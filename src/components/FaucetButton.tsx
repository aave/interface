import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Button, SvgIcon, Typography } from '@mui/material';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { DarkTooltip } from './infoTooltips/DarkTooltip';

export const FaucetButton = () => {
  const { currentNetworkConfig } = useProtocolDataContext();

  const onClick = () => {
    window.open(`${window.location.origin}/faucet`);
  };

  return (
    <DarkTooltip title="Get free assets to test the Aave Protocol">
      <Button variant="outlined" size="small" onClick={onClick}>
        <Typography sx={{ display: 'inline-flex', alignItems: 'center' }} variant="buttonS">
          <Trans>{currentNetworkConfig.name} Faucet</Trans>
          <SvgIcon sx={{ fontSize: '14px', mx: '2px' }}>
            <ExternalLinkIcon />
          </SvgIcon>
        </Typography>
      </Button>
    </DarkTooltip>
  );
};
