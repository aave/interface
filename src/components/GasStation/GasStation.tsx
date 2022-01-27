import React, { useState } from 'react';
import {
  Box,
  BoxProps,
  styled,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Settings } from '@mui/icons-material';
import { Select, Trans } from '@lingui/macro';
import { GasOption, useGasStation } from './GasStationProvider';

const GasDropdown = styled('div')<{ open: boolean }>(({ open }) => ({
  maxHeight: open ? '100px' : 0,
  transition: open ? 'max-height 0.25s ease-in;' : 'max-height 0.15s ease-out',
  overflow: 'hidden',
  marginTop: '8px',
}));

export const GasStation: React.FC<BoxProps> = (_props) => {
  const { state, dispatch } = useGasStation();
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);

  const onSetGasPrice = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    gasOption: GasOption
  ) => {
    if (gasOption !== null) {
      dispatch({ type: 'setGasOption', value: gasOption });
    }
  };

  const onSetCustomGasPrice = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    dispatch({ type: 'setCustomGasOption', value: parseInt(event.target.value) });
  };

  const onClickCustomGasField = () => {
    dispatch({ type: 'setCustomGasOption', value: state.customGas });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <LocalGasStationIcon fontSize="small" color="primary" sx={{ mr: '5px' }} />
        <Typography sx={{ mr: '4px' }}>$ 130</Typography>
        <Typography sx={{ mr: '4px' }}>
          (
          {state.gasOption === GasOption.Custom ? (
            `${state.customGas} Gwei`
          ) : (
            <Select value={state.gasOption} slow="Slow" normal="Normal" fast="Fast" other="-" />
          )}
          )
        </Typography>
        <Settings
          fontSize="small"
          color="primary"
          onClick={toggleDropdown}
          sx={{ cursor: 'pointer' }}
        />
      </Box>

      <GasDropdown open={open}>
        <ToggleButtonGroup
          value={state.gasOption}
          exclusive
          onChange={onSetGasPrice}
          aria-label="Gas price selector"
          size="small"
          sx={{
            fontSize: '12px',
            mr: '4px',
          }}
          color="primary"
        >
          <ToggleButton value={GasOption.Slow} aria-label="Slow" sx={{ fontSize: 'inherit' }}>
            <Trans>Slow</Trans>
          </ToggleButton>
          <ToggleButton value={GasOption.Normal} aria-label="Normal" sx={{ fontSize: 'inherit' }}>
            <Trans>Normal</Trans>
          </ToggleButton>
          <ToggleButton value={GasOption.Fast} aria-label="High" sx={{ fontSize: 'inherit' }}>
            <Trans>Fast</Trans>
          </ToggleButton>
          <ToggleButton value={GasOption.Custom} aria-label="Custom" sx={{ fontSize: 'inherit' }}>
            <Trans>Custom</Trans>
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          onClick={onClickCustomGasField}
          onChange={onSetCustomGasPrice}
          defaultValue={state.customGas}
          size="small"
          sx={{ width: 40 }}
          inputProps={{ style: { fontSize: '12px', padding: '5.5px 7px' } }}
        />
      </GasDropdown>
    </Box>
  );
};
