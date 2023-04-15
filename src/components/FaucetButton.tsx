import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import ExternalLinkButton from './ExternalLinkButton';
import { DarkTooltip } from './infoTooltips/DarkTooltip';
import { ROUTES } from './primitives/Link';

export const FaucetButton = () => {
  const { currentNetworkConfig } = useProtocolDataContext();

  return (
    <DarkTooltip title="Get free assets to test the Aave Protocol">
      <ExternalLinkButton
        startIcon={
          <img
            src={currentNetworkConfig.networkLogoPath}
            alt={currentNetworkConfig.name}
            style={{ width: 14, height: 14 }}
          />
        }
        href={ROUTES.faucet}
        size="small"
      >
        <Typography variant="buttonS">
          <Trans>{currentNetworkConfig.name} Faucet</Trans>
        </Typography>
      </ExternalLinkButton>
    </DarkTooltip>
  );
};
