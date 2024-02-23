import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Box from '@mui/material/Box';

const networks = ['Ethereum', 'Polygon'];

interface NetworkConfiguration {
  baseAssetDecimals: number;
  baseAssetSymbol: string;
  chainId: number;
  explorerLink: string;
  isTestnet: boolean;
  name: string;
  networkLogoPath: string;
  publicJsonRPCUrl: string[];
  publicJsonRPCWSUrl: string;
  wrappedBaseAssetSymbol: string;
}

interface NetworkProps {
  supportedBridgeMarkets: NetworkConfiguration[];
  onNetworkChange: (network: NetworkConfiguration) => void;
}

// If this is for a React component prop, for example:

export const NetworkSelect = ({ supportedBridgeMarkets, onNetworkChange }): NetworkProps => {
  const theme = useTheme();

  const [network, setNetwork] = React.useState<NetworkConfiguration | ''>('');

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const selectedNetwork = event.target.value as NetworkConfiguration;
    setNetwork(selectedNetwork);
    onNetworkChange(selectedNetwork);
  };

  return (
    <Box>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="network-select-label">Network</InputLabel>
        <Select
          // labelId="network-select-label"
          id="network-select"
          value={network}
          onChange={handleChange}
          input={<OutlinedInput label="Network" />}
          // sx={{
          //   borderRadius: '8px',
          //   border: '1px solid var(--Light-Other-Outlined-Border, rgba(56, 61, 81, 0.12))',
          //   background:
          //     theme.palette.mode === 'dark'
          //       ? 'var(--Dark-Other-Outlined-Background, #1E2026)'
          //       : 'var(--Light-Other-Outlined-Background, #F7F7F9)',
          // }}

          inputProps={{
            MenuProps: {
              // sx: {
              //   background: 'green',
              // },
              MenuListProps: {
                sx: {
                  background: 'red',
                  borderRadius: '8px',
                  padding: '7.5px 0px 8.5px 0px',
                },
              },
            },
          }}
        >
          {supportedBridgeMarkets.map((network: NetworkConfiguration) => (
            <MenuItem key={network.chainId} value={network}>
              {network.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
