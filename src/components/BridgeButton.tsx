import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Button, SvgIcon, Typography } from '@mui/material';

import { NetworkConfig } from '../ui-config/networksConfig';
import { Link } from './primitives/Link';

export const BridgeButton = ({ bridge }: Pick<NetworkConfig, 'bridge'>) => {
  if (!bridge) return null;

  return (
    <Button
      startIcon={<img src={bridge.icon} alt={bridge.name} style={{ width: 14, height: 14 }} />}
      endIcon={
        <SvgIcon sx={{ width: 14, height: 14 }}>
          <ExternalLinkIcon />
        </SvgIcon>
      }
      component={Link}
      size="small"
      variant="outlined"
      href={bridge.url || ''}
    >
      <Typography variant="buttonS">{bridge.name}</Typography>
    </Button>
  );
};
