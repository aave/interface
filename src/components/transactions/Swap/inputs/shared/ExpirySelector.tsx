import { ChevronDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  SvgIcon,
  Typography,
} from '@mui/material';

import { Expiry } from '../../types';

interface ExpirySelectorProps {
  selectedExpiry: Expiry;
  setSelectedExpiry: (value: Expiry) => void;
}

export const ExpirySelector = ({ selectedExpiry, setSelectedExpiry }: ExpirySelectorProps) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedExpiry(event.target.value as unknown as Expiry);
  };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography
          color="text.secondary"
          variant="subheader2"
          sx={{ height: '100%', marginRight: -1, opacity: 0.75 }}
        >
          <Trans>Expires in</Trans>
        </Typography>
      </Box>
      <FormControl sx={{ minWidth: 'unset', width: 'unset' }}>
        <Select
          native={false}
          value={String(selectedExpiry)}
          onChange={handleChange}
          IconComponent={(props) => (
            <SvgIcon sx={{ fontSize: '14px' }} {...props}>
              <ChevronDownIcon />
            </SvgIcon>
          )}
          sx={{
            '&.MuiInputBase-root': {
              border: 0,
              '.MuiSelect-select': {
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
          {Object.entries(Expiry).map(([key, value]) => (
            <MenuItem value={value} key={`${key}`}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: -1.5,
                }}
              >
                <Typography variant="subheader2" color="text.secondary">
                  {value}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
