import { XIcon } from '@heroicons/react/outline';
import { IconButton, SvgIcon } from '@mui/material';
import React from 'react';

interface MobileCloseButtonProps {
  setOpen: (value: boolean) => void;
}

export const MobileCloseButton = ({ setOpen }: MobileCloseButtonProps) => {
  return (
    <IconButton onClick={() => setOpen(false)} sx={{ p: 0, mr: { xs: -2, xsm: 1 } }}>
      <SvgIcon sx={{ color: 'common.white', fontSize: '32px' }}>
        <XIcon />
      </SvgIcon>
    </IconButton>
  );
};
