import { styled, ToggleButton, ToggleButtonProps } from '@mui/material';
import React from 'react';

interface CustomToggleButtonProps extends ToggleButtonProps {
  unselectedBackgroundColor?: string;
  maxWidth?: string;
}

const CustomToggleButton = styled(ToggleButton)<CustomToggleButtonProps>(
  ({ theme, unselectedBackgroundColor }) => ({
    border: '0px',
    flex: 1,
    backgroundColor: unselectedBackgroundColor || '#383D51',
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
  })
) as typeof ToggleButton;

const CustomTxModalToggleButton = styled(ToggleButton)<CustomToggleButtonProps>(
  ({ theme, unselectedBackgroundColor, maxWidth }) => ({
    border: '0px',
    flex: 1,
    color: theme.palette.text.muted,
    borderRadius: '4px',
    backgroundColor: unselectedBackgroundColor || '#383D51',
    maxWidth: maxWidth || '100%',

    '&.Mui-selected, &.Mui-selected:hover': {
      border: `1px solid ${theme.palette.other.standardInputLine}`,
      backgroundColor: '#FFFFFF',
      borderRadius: '4px !important',
    },

    '&.Mui-selected, &.Mui-disabled': {
      zIndex: 100,
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      color: theme.palette.background.header,
    },
  })
) as typeof ToggleButton;

export function StyledTxModalToggleButton(props: CustomToggleButtonProps) {
  return <CustomTxModalToggleButton {...props} />;
}

export default function StyledToggleButton(props: ToggleButtonProps) {
  return <CustomToggleButton {...props} />;
}
