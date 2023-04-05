import { styled, ToggleButton, ToggleButtonProps } from '@mui/material';
import React from 'react';

const CustomToggleButton = styled(ToggleButton)<ToggleButtonProps>(({ theme }) => ({
  border: '0px',
  flex: 1,
  backgroundColor: '#383D51',
  borderRadius: '4px',

  '&.Mui-selected, &.Mui-selected:hover': {
    backgroundColor: '#FEFEFE',
    borderRadius: '4px !important',
  },

  '&.Mui-selected, &.Mui-disabled': {
    zIndex: 100,
    height: '100%',
    display: 'flex',
    justifyContent: 'center',

    '.MuiTypography-subheader1': {
      background: theme.palette.gradients.aaveGradient,
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
    '.MuiTypography-secondary14': {
      background: theme.palette.gradients.aaveGradient,
      backgroundClip: 'text',
      textFillColor: 'transparent',
    },
  },
})) as typeof ToggleButton;

export default function StyledToggleButton(props: ToggleButtonProps) {
  return <CustomToggleButton {...props} />;
}
