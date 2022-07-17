import { Trans } from '@lingui/macro';
import { Checkbox, FormLabel, Typography } from '@mui/material';

import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import * as React from 'react';
import { Row } from 'src/components/primitives/Row';
import { EmodeCategory } from 'src/helpers/types';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { getEmodeMessage } from './EmodeNaming';

export type EmodeSelectProps = {
  emodeCategories: Record<number, EmodeCategory>;
  selectedEmode: number;
  setSelectedEmode: React.Dispatch<React.SetStateAction<EmodeCategory | undefined>>;
  baseAssetSymbol: string;
};

export const EmodeSelect = ({
  emodeCategories,
  selectedEmode,
  setSelectedEmode,
  baseAssetSymbol,
}: EmodeSelectProps) => {
  const { user } = useAppDataContext();
  return (
    <FormControl sx={{ mb: 1, width: '100%' }}>
      <FormLabel sx={{ mb: 1, color: 'text.secondary' }}>
        <Trans>Asset category</Trans>
      </FormLabel>

      <Select
        value={selectedEmode}
        onChange={(e) => {
          setSelectedEmode(emodeCategories[Number(e.target.value)]);
        }}
        className="EmodeSelect"
        data-cy="EmodeSelect"
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
        renderValue={(emode) => {
          if (emode === 0) {
            return (
              <Typography color="text.primary">
                <Trans>Disable</Trans> E-mode
              </Typography>
            );
          }

          return (
            <Typography color="text.primary">
              {getEmodeMessage(emodeCategories[selectedEmode].id, baseAssetSymbol)}
            </Typography>
          );
        }}
      >
        {Object.keys(emodeCategories).map((categoryKey) => {
          if (emodeCategories[Number(categoryKey)].id !== 0) {
            return (
              <MenuItem
                key={`emode-${emodeCategories[Number(categoryKey)].id}`}
                value={emodeCategories[Number(categoryKey)].id}
                sx={{
                  display:
                    emodeCategories[Number(categoryKey)].id === selectedEmode ? 'none' : undefined,
                }}
              >
                {
                  <Typography color="text.primary">
                    {getEmodeMessage(emodeCategories[Number(categoryKey)].id, baseAssetSymbol)}
                  </Typography>
                }
              </MenuItem>
            );
          }
        })}
      </Select>

      {user.userEmodeCategoryId !== 0 && (
        <Row
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
        >
          <Typography>Disable E-mode</Typography>
          <Checkbox
            value={0}
            defaultChecked={false}
            onChange={(e) => {
              e.target.checked === true
                ? setSelectedEmode(emodeCategories[Number(e.target.value)])
                : (e.target.value = String(user.userEmodeCategoryId)) &&
                  setSelectedEmode(emodeCategories[Number(e.target.value)]);
            }}
          />
        </Row>
      )}
    </FormControl>
  );
};
