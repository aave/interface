import { Box, BoxProps, FormControl, MenuItem, Select, Typography } from '@mui/material';
import * as React from 'react';

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
  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const chainId = event.target.value as number;
    const selectedNetwork = supportedBridgeMarkets.find((network) => network.chainId === chainId);

    if (selectedNetwork) {
      onNetworkChange(selectedNetwork);
    }
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box
        sx={(theme) => ({
          p: '8px 0px',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '6px',
          mb: 1,
        })}
      >
        <Typography color="text.secondary" sx={{ p: '0px 12px' }}>
          Network
        </Typography>
        <FormControl fullWidth>
          <Select
            id="network-select"
            value={defaultNetwork.chainId}
            // TODO: NETWORK CONFIGURED
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onChange={handleChange}
            variant="outlined"
            sx={{
              '.MuiSelect-select': {
                background: 'transparent',
              },
              '& .MuiOutlinedInput-root': {
                background: 'transparent',
                '&:hover': {
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'currentColor',
                  },
                },
                '&.Mui-focused': {
                  '.MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& .MuiSelect-icon': {
                marginRight: '12px',
              },
            }}
            inputProps={{
              MenuProps: {
                MenuListProps: {
                  sx: {},
                },
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
