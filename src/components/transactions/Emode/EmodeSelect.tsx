import { useState } from 'react';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, FormLabel, Typography } from '@mui/material';
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
  userEmode: number;
};

export const EmodeSelect = ({
  emodeCategories,
  selectedEmode,
  setSelectedEmode,
  baseAssetSymbol,
  userEmode,
}: EmodeSelectProps) => {
  const { user } = useAppDataContext();
  const [disableEmode, setDisableEmode] = useState<boolean>(selectedEmode === 0 ? true : false);
  return (
    <FormControl sx={{ mb: 1, width: '100%' }}>
      <FormLabel sx={{ mb: 1, color: 'text.secondary' }}>
        <Trans>Switch asset category</Trans>
      </FormLabel>

      <Select
        value={selectedEmode}
        onChange={(e) => {
          setSelectedEmode(emodeCategories[Number(e.target.value)]);
        }}
        className="EmodeSelect"
        data-cy="EmodeSelect"
        disabled={disableEmode}
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
          if (disableEmode) {
            return <Typography color="text.primary">----------</Typography>;
          }
          if (emode !== 0) {
            return (
              <Typography color="text.primary">
                {getEmodeMessage(emodeCategories[selectedEmode].id, baseAssetSymbol)}
              </Typography>
            );
          }
        }}
      >
        {Object.keys(emodeCategories).map((categoryKey) => {
          if (userEmode !== Number(categoryKey) && Number(categoryKey) !== 0) {
            return (
              <MenuItem
                key={`emode-${emodeCategories[Number(categoryKey)].id}`}
                value={emodeCategories[Number(categoryKey)].id}
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
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
            <Typography variant="description" color="text.primary">
              <Trans>or</Trans>
            </Typography>
          </Box>
          <Row
            sx={{
              width: '100%',
              alignItems: 'center',
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
            <FormLabel sx={{ color: 'text.secondary' }}>
              <Trans>Disable E-mode</Trans>
            </FormLabel>

            <Checkbox
              sx={{ px: 0 }}
              value={disableEmode}
              defaultChecked={false}
              onChange={() => {
                if (disableEmode) {
                  setSelectedEmode(userEmode === 1 ? emodeCategories[2] : emodeCategories[1]);
                } else {
                  setSelectedEmode(emodeCategories[0]);
                }
                setDisableEmode(!disableEmode);
              }}
            />
          </Row>
        </>
      )}
    </FormControl>
  );
};
