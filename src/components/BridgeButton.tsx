import { Typography } from '@mui/material';

import { NetworkConfig } from '../ui-config/networksConfig';
import ExternalLinkButton from './ExternalLinkButton';

export const BridgeButton = ({ bridge }: Pick<NetworkConfig, 'bridge'>) => {
  if (!bridge) return null;

  return (
    <ExternalLinkButton
      startIcon={<img src={bridge.icon} alt={bridge.name} style={{ width: 14, height: 14 }} />}
      size="small"
      href={bridge.url || ''}
    >
      <Typography variant="buttonS">{bridge.name}</Typography>
    </ExternalLinkButton>
  );
};
