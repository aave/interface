import { styled, ToggleButton, ToggleButtonProps } from '@mui/material';
import React from 'react';
import { figVars } from 'src/utils/figmaColors';

const CustomTxModalToggleButton = styled(ToggleButton)<ToggleButtonProps>({
  border: 0,
  flex: 1,
  height: '100%',
  color: figVars['fg-3'],

  // Inactive hover: brighten the label only (fg-3 → fg-2), never a background.
  '&:hover': {
    backgroundColor: 'transparent',
    color: figVars['fg-2'],
  },

  // Active — and keyboard focus (Mui-focusVisible): a solid fill one step darker than the
  // `bg-1` track (no shadow; the group carries the only ring) with primary text.
  '&.Mui-selected, &.Mui-selected:hover, &.Mui-focusVisible': {
    backgroundColor: figVars['bg-4'],
    color: figVars['fg-1'],
  },

  // Disabled but NOT selected: muted, still readable.
  '&.Mui-disabled:not(.Mui-selected)': {
    color: figVars['fg-3'],
    opacity: 0.5,
  },

  // Disabled + selected: preserve the selected look (some consumers disable the active tab).
  '&.Mui-disabled.Mui-selected': {
    backgroundColor: figVars['bg-4'],
    color: figVars['fg-1'],
    opacity: 1,
  },
}) as typeof ToggleButton;

export function StyledTxModalToggleButton(props: ToggleButtonProps) {
  return <CustomTxModalToggleButton {...props} />;
}
