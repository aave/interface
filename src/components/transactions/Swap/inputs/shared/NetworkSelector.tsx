import { Box, FormControl, MenuItem, Select, SelectChangeEvent, Typography } from '@mui/material';
import { MarketLogo } from 'src/components/MarketSwitcher';

import { SupportedNetworkWithChainId } from '../../helpers/shared/misc.helpers';

interface NetworkSelectorProps {
  networks: SupportedNetworkWithChainId[];
  selectedNetwork: number;
  setSelectedNetwork: (value: number) => void;
}

export const NetworkSelector = ({
  networks,
  selectedNetwork,
  setSelectedNetwork,
}: NetworkSelectorProps) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedNetwork(Number(event.target.value));
  };
  return (
    <FormControl sx={{ minWidth: 'unset', width: 'unset' }}>
      <Select
        native={false}
        value={String(selectedNetwork)}
        onChange={handleChange}
        MenuProps={{
          anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
          transformOrigin: { vertical: 'top', horizontal: 'left' },
          sx: { '& .MuiPaper-root': { marginLeft: '-4px' } },
        }}
        sx={{
          // Flatten the trigger to a plain text button: override the theme's Select-pill
          // (bg fill + surface-shadow ring) in all states. `&&` matches the theme's specificity.
          '&&, &&:hover, &&:has(.MuiSelect-select[aria-expanded="true"])': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
          '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'transparent',
            paddingLeft: 0,
          },
        }}
      >
        {networks.map((network) => (
          <MenuItem value={network.chainId} key={`${network.name}`}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MarketLogo
                size={24}
                logo={network.networkLogoPath}
                sx={{
                  mr: 1,
                }}
              />
              <Typography variant="h5" color="fg-1">
                {network.displayName || network.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
