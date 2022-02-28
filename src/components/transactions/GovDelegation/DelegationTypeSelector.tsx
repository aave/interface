import { Trans } from '@lingui/macro';
import { FormControl, MenuItem, OutlinedInput, Select } from '@mui/material';
import React from 'react';
import { DelegationType } from 'src/helpers/types';

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

export type DelegationTypeSelectorProps = {
  delegationType: DelegationType;
  setDelegationType: React.Dispatch<React.SetStateAction<DelegationType>>;
};

export const DelegationTypeSelector = ({
  delegationType,
  setDelegationType,
}: DelegationTypeSelectorProps) => {
  return (
    <FormControl variant="standard" fullWidth sx={{ mb: 6 }}>
      <Select
        fullWidth
        input={<OutlinedInput />}
        MenuProps={MenuProps}
        value={delegationType}
        sx={{
          '& .MuiSvgIcon-root': {
            right: '12px',
          },
        }}
        onChange={(e) => {
          setDelegationType(e.target.value as DelegationType);
        }}
      >
        <MenuItem value={DelegationType.VOTING}>
          <Trans>Voting power</Trans>
        </MenuItem>
        <MenuItem value={DelegationType.PROPOSITION_POWER}>
          <Trans>Proposition power</Trans>
        </MenuItem>
      </Select>
    </FormControl>
  );
};
