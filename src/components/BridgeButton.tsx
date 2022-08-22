import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Button, SvgIcon, Typography } from '@mui/material';

import { NetworkConfig } from '../ui-config/networksConfig';
import { Link } from './primitives/Link';

export const BridgeButton = ({ bridge }: Pick<NetworkConfig, 'bridge'>) => {
  if (!bridge) return null;

  return (
    <Button component={Link} size="small" variant="outlined" href={bridge.url || ''}>
      <img src={bridge.icon} alt={bridge.name} style={{ width: 14, height: 14 }} />
      <Typography sx={{ mx: 1 }} variant="buttonS">
        {bridge.name}
      </Typography>
      <SvgIcon sx={{ fontSize: 14 }}>
        <ExternalLinkIcon />
      </SvgIcon>
    </Button>
  );
};
