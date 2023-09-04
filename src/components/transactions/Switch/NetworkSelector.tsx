import { ChevronDownIcon } from '@heroicons/react/outline';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SvgIcon,
  Typography,
} from '@mui/material';
import { MarketLogo } from 'src/components/MarketSwitcher';

interface Network {
  name: string;
  chainId: number;
  networkLogoPath: string;
}

interface NetworkSelectorProps {
  networks: Network[];
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
        IconComponent={(props) => (
          <SvgIcon sx={{ fontSize: '14px' }} {...props}>
            <ChevronDownIcon />
          </SvgIcon>
        )}
        sx={{
          '&.MuiInputBase-root': {
            paddingRight: '4px',
            border: 0,
            '.MuiSelect-select': {
              paddingRight: '20px',
              display: 'flex',
              backgroundColor: 'transparent',
              border: 0,
            },
          },
          '& .MuiOutlinedInput-notchedOutline': {
            border: 'none',
          },
        }}
      >
        {networks.map((network) => (
          <MenuItem value={network.chainId} key={`${network.name}`}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MarketLogo
                size={16}
                logo={network.networkLogoPath}
                sx={{
                  mr: 1,
                }}
              />
              <Typography variant="subheader2" color="#4D6EEE">
                {network.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
