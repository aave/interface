import { styled, ToggleButton, ToggleButtonProps } from '@mui/material';
import React from 'react';

const CustomToggleButton = styled(ToggleButton)<ToggleButtonProps>(({ theme }) => ({
  border: '0px',
  flex: 1,
  backgroundColor: theme.palette.background.default,
  borderRadius: '4px',

  '&.Mui-selected, &.Mui-selected:hover': {
    backgroundColor: theme.palette.primary.main,
    borderRadius: '4px !important',
  },

  '&.Mui-selected, &.Mui-disabled': {
    zIndex: 100,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',

    '.MuiTypography-subheader1': {
      background: theme.palette.background.default,
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
    '.MuiTypography-secondary14': {
      background: theme.palette.background.default,
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
  },
})) as typeof ToggleButton;

export default function StyledToggleButton(props: ToggleButtonProps) {
  return <CustomToggleButton {...props} />;
}
