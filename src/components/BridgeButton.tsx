import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Box, Button, ButtonProps, SvgIcon, Typography } from '@mui/material';

import { NetworkConfig } from '../ui-config/networksConfig';
import { Link } from './primitives/Link';

interface BridgeButtonProps extends Pick<NetworkConfig, 'bridge'>, ButtonProps<typeof Link> {}

export const BridgeButton = ({ bridge, ...rest }: BridgeButtonProps) => {
  if (!bridge) return null;

  return (
    <Button
      component={Link}
      size="small"
      href={bridge.url || ''}
      sx={{ p: '2px 4px', ...rest.sx }}
      {...rest}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <img src={bridge.icon} alt={bridge.name} style={{ width: 14, height: 14 }} />
        <Typography sx={{ mx: 1 }}>{bridge.name}</Typography>
        <SvgIcon sx={{ fontSize: 14 }}>
          <ExternalLinkIcon />
        </SvgIcon>
      </Box>
    </Button>
  );
};
