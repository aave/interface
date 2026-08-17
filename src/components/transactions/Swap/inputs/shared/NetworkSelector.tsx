import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { ChevronDownIcon } from 'src/components/icons/ChevronDownIcon';
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const selected = networks.find((network) => network.chainId === selectedNetwork);

  return (
    <>
      <Button
        variant="text"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ px: 0, '&:hover': { backgroundColor: 'transparent' } }}
      >
        {selected && (
          <MarketLogo size={18} logo={selected.networkLogoPath} sx={{ mr: '0.38rem' }} />
        )}
        <Typography
          sx={{ color: 'fg-1', fontSize: '0.75rem', fontWeight: 500, lineHeight: '120%' }}
        >
          {selected?.displayName || selected?.name}
        </Typography>
        <ChevronDownIcon
          sx={{
            ml: '0.25rem',
            fontSize: '0.75rem',
            color: 'fg-3',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease-in-out',
          }}
        />
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {networks.map((network) => (
          <MenuItem
            key={network.name}
            selected={network.chainId === selectedNetwork}
            onClick={() => {
              setSelectedNetwork(network.chainId);
              setAnchorEl(null);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MarketLogo size={24} logo={network.networkLogoPath} sx={{ mr: 1 }} />
              <Typography variant="h5" color="fg-1">
                {network.displayName || network.name}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
