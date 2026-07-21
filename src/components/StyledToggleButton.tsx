import { styled, ToggleButton, ToggleButtonProps } from '@mui/material';
import React from 'react';
import { figVars } from 'src/utils/figmaColors';

const CustomToggleButton = styled(ToggleButton)<ToggleButtonProps>({
  border: '0px',
  flex: 1,
  backgroundColor: '#383D51',
  borderRadius: '4px',

  '&.Mui-selected, &.Mui-selected:hover': {
    backgroundColor: '#FFFFFF',
    borderRadius: '4px !important',
  },

  '&.Mui-selected, &.Mui-disabled': {
    zIndex: 100,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',

    '.MuiTypography-subheader1': {
      color: figVars['purple-1'],
    },
    '.MuiTypography-secondary14': {
      color: figVars['purple-1'],
    },
  },
}) as typeof ToggleButton;

const CustomTxModalToggleButton = styled(ToggleButton)<ToggleButtonProps>({
  border: '0px',
  flex: 1,
  color: figVars['fg-3'],
  borderRadius: '4px',

  // Selected (active) state
  '&.Mui-selected, &.Mui-selected:hover': {
    border: `1px solid ${figVars['input-line']}`,
    backgroundColor: '#FFFFFF',
    borderRadius: '4px !important',
    color: figVars['bg-1'],
    zIndex: 100,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },

  // Disabled but NOT selected: keep readable text with slight fade
  '&.Mui-disabled:not(.Mui-selected)': {
    color: figVars['fg-2'],
    opacity: 0.55,
  },

  // Disabled + selected: preserve the selected look
  '&.Mui-disabled.Mui-selected': {
    border: `1px solid ${figVars['input-line']}`,
    backgroundColor: '#FFFFFF',
    borderRadius: '4px !important',
    color: figVars['bg-1'],
    opacity: 1,
  },
}) as typeof ToggleButton;

export function StyledTxModalToggleButton(props: ToggleButtonProps) {
  return <CustomTxModalToggleButton {...props} />;
}

export default function StyledToggleButton(props: ToggleButtonProps) {
  return <CustomToggleButton {...props} />;
}
