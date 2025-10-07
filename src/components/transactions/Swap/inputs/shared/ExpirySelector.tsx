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
  selectedExpiry: number;
  setSelectedExpiry: (value: number) => void;
}

export const ExpirySelector = ({ selectedExpiry, setSelectedExpiry }: ExpirySelectorProps) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedExpiry(Number(event.target.value));
  };
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Typography color="text.secondary">Expires in</Typography>
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="subheader2" color="text.secondary">
                  <Trans>{key}</Trans>
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
