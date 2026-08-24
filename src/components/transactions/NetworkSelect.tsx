import {
  Box,
  BoxProps,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { figSurfaceShadow } from 'src/utils/figmaColors';

import { SupportedNetworkWithChainId } from './Bridge/BridgeConfig';

interface NetworkProps {
  supportedBridgeMarkets: SupportedNetworkWithChainId[];
  onNetworkChange: (network: SupportedNetworkWithChainId) => void;
  defaultNetwork: SupportedNetworkWithChainId;
  sx?: BoxProps;
}

export const NetworkSelect = ({
  supportedBridgeMarkets,
  onNetworkChange,
  defaultNetwork,
  sx = {},
}: NetworkProps) => {
  const handleChange = (event: SelectChangeEvent) => {
    const chainId = Number(event.target.value);
    const selectedNetwork = supportedBridgeMarkets.find((network) => network.chainId === chainId);

    if (selectedNetwork) {
      onNetworkChange(selectedNetwork);
    }
  };

  // Disable dropdown components if there is only one network
  const disabled = supportedBridgeMarkets.length === 1;

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box
        sx={{
          p: '8px 0px',
          borderRadius: '0.75rem',
          boxShadow: figSurfaceShadow('shadow-stroke-1'),
          backgroundColor: 'bg-2',
          mb: 1,
        }}
      >
        <Typography color="fg-2" sx={{ p: '0px 12px' }}>
          Network
        </Typography>
        <FormControl fullWidth>
          <Select
            id="network-select"
            disabled={disabled}
            value={defaultNetwork.chainId.toString()}
            onChange={handleChange}
            variant="outlined"
            sx={{
              // Flatten the trigger: strip the theme's Select-pill (bg fill + surface-shadow ring)
              // in all states so only the outer container remains. `&&` matches the theme's specificity.
              '&&, &&:hover, &&:has(.MuiSelect-select[aria-expanded="true"])': {
                backgroundColor: 'transparent',
                boxShadow: 'none',
              },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSelect-select': {
                backgroundColor: 'transparent',
              },
              '& .MuiSelect-icon': {
                marginRight: '12px',
                display: disabled ? 'none' : 'inline-block',
              },
              '& .MuiOutlinedInput-input.Mui-disabled': {
                backgroundColor: 'transparent',
                opacity: 1,
                '-webkit-text-fill-color': 'unset',
              },
            }}
          >
            {supportedBridgeMarkets.map((network: SupportedNetworkWithChainId) => (
              <MenuItem key={network.chainId} value={network.chainId}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={network.networkLogoPath}
                    alt={network.name}
                    style={{ marginRight: 8, width: 18, height: 18 }}
                  />
                  <Typography variant="h3" color="primary">
                    {network.name}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};
