import { ChevronDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { FormLabel, SvgIcon, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import * as React from 'react';
import { EmodeCategory } from 'src/helpers/types';

import { getEmodeMessage } from './EmodeNaming';

export type EmodeSelectProps = {
  emodeCategories: Record<number, EmodeCategory>;
  selectedEmode: number;
  setSelectedEmode: React.Dispatch<React.SetStateAction<EmodeCategory | undefined>>;
};

export const EmodeSelect = ({
  emodeCategories,
  selectedEmode,
  setSelectedEmode,
}: EmodeSelectProps) => {
  return (
    <FormControl sx={{ mb: 1, width: '100%' }}>
      <FormLabel sx={{ mb: 1, color: 'text.secondary' }}>
        <Trans>Asset category</Trans>
      </FormLabel>

      <Select
        value={selectedEmode}
        onChange={(e) => setSelectedEmode(emodeCategories[Number(e.target.value)])}
        className="EmodeSelect"
        sx={{
          width: '100%',
          height: '44px',
          borderRadius: '6px',
          borderColor: 'divider',
          outline: 'none !important',
          color: 'text.primary',
          '.MuiOutlinedInput-input': {
            backgroundColor: 'transparent',
          },
          '.MuiOutlinedInput-notchedOutline, .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
            outline: 'none !important',
            borderWidth: '1px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'divider',
            borderWidth: '1px',
          },
          '&.EmodeSelect .MuiSelect-icon': { color: 'text.primary' },
        }}
        native={false}
        IconComponent={(props) => (
          <SvgIcon fontSize="small" {...props}>
            <ChevronDownIcon />
          </SvgIcon>
        )}
        renderValue={(emode) => {
          if (emode === 0) {
            return (
              <Typography color="text.primary">
                E-Mode <Trans>disabled</Trans>
              </Typography>
            );
          }

          return (
            <Typography color="text.primary">
              {getEmodeMessage(emodeCategories[selectedEmode].id)}
            </Typography>
          );
        }}
      >
        {Object.keys(emodeCategories).map((categoryKey) => (
          <MenuItem
            key={`emode-${emodeCategories[Number(categoryKey)].id}`}
            value={emodeCategories[Number(categoryKey)].id}
          >
            {emodeCategories[Number(categoryKey)].id === 0 ? (
              <Typography color="text.primary">
                E-Mode <Trans>disabled</Trans>
              </Typography>
            ) : (
              <Typography color="text.primary">
                {getEmodeMessage(emodeCategories[Number(categoryKey)].id)}
              </Typography>
            )}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
