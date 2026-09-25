import { Button, Typography } from '@mui/material';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';

import { NetworkConfig } from '../ui-config/networksConfig';
import { Link } from './primitives/Link';

export const BridgeButton = ({ bridge }: Pick<NetworkConfig, 'bridge'>) => {
  if (!bridge) return null;

  return (
    <Button
      startIcon={<img src={bridge.icon} alt={bridge.name} style={{ width: 14, height: 14 }} />}
      endIcon={<ArrowUpRightIcon sx={{ width: 14, height: 14 }} />}
      component={Link}
      size="small"
      variant="tertiary"
      href={bridge.url || ''}
    >
      <Typography variant="buttonS">{bridge.name}</Typography>
    </Button>
  );
};
