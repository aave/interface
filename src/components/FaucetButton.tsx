import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Button, SvgIcon, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { DarkTooltip } from './infoTooltips/DarkTooltip';
import { ROUTES } from './primitives/Link';

export const FaucetButton = () => {
  const { currentNetworkConfig } = useProtocolDataContext();
  const router = useRouter();

  return (
    <DarkTooltip title="Get free assets to test the Aave Protocol">
      <Button variant="outlined" size="small" onClick={() => router.push(ROUTES.faucet)}>
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
