import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import * as React from 'react';
import { EmodeCategory } from 'src/helpers/types';

import { getEmodeMessage } from './EmodeNaming';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

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
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <Select
          value={selectedEmode}
          onChange={(e) => setSelectedEmode(emodeCategories[Number(e.target.value)])}
          input={<OutlinedInput />}
          MenuProps={MenuProps}
          native={false}
          renderValue={(emode) => {
            if (emode === 0) {
              return (
                <Typography>
                  E-Mode <Trans>disabled</Trans>
                </Typography>
              );
            }

            return <Typography>{getEmodeMessage(emodeCategories[selectedEmode].id)}</Typography>;
          }}
        >
          {Object.keys(emodeCategories)
            .filter((categoryKey) => emodeCategories[Number(categoryKey)].id !== selectedEmode)
            .map((categoryKey) => (
              <MenuItem
                key={`emode-${emodeCategories[Number(categoryKey)].id}`}
                value={emodeCategories[Number(categoryKey)].id}
              >
                {emodeCategories[Number(categoryKey)].id === 0 ? (
                  <Typography>
                    E-Mode <Trans>disabled</Trans>
                  </Typography>
                ) : (
                  <Typography>
                    {getEmodeMessage(emodeCategories[Number(categoryKey)].id)}
                  </Typography>
                )}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </div>
  );
};
