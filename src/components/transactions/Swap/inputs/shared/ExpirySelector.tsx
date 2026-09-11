import { Trans } from '@lingui/macro';
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material';
import { useState } from 'react';
import { ChevronDownIcon } from 'src/components/icons/ChevronDownIcon';

import { Expiry } from '../../types';

interface ExpirySelectorProps {
  selectedExpiry: Expiry;
  setSelectedExpiry: (value: Expiry) => void;
}

export const ExpirySelector = ({ selectedExpiry, setSelectedExpiry }: ExpirySelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <Typography color="fg-2" variant="subheader2" sx={{ opacity: 0.75 }}>
        <Trans>Expires in</Trans>
      </Typography>

      <Button
        variant="text"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        sx={{ px: 0, '&:hover': { backgroundColor: 'transparent' } }}
      >
        <Typography
          sx={{ color: 'fg-1', fontSize: '0.75rem', fontWeight: 500, lineHeight: '120%' }}
        >
          {selectedExpiry}
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
        {Object.values(Expiry).map((value) => (
          <MenuItem
            key={value}
            selected={value === selectedExpiry}
            onClick={() => {
              setSelectedExpiry(value);
              setAnchorEl(null);
            }}
          >
            <Typography variant="subheader2" color="fg-2">
              {value}
            </Typography>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
