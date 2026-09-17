import { Drawer } from '@mui/material';
import { ReactNode } from 'react';

import { HEADER_HEIGHT } from '../headerLayout';

interface DrawerWrapperProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  children: ReactNode;
}

export const DrawerWrapper = ({ open, setOpen, children }: DrawerWrapperProps) => {
  return (
    <Drawer
      data-cy={`mobile-menu`}
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      hideBackdrop
      disableScrollLock
      sx={{ top: `${HEADER_HEIGHT}px` }}
      PaperProps={{
        sx: {
          bgcolor: 'bg-1',
          boxShadow: 'none',
          borderRadius: 'unset',
          width: '100%',
          top: `${HEADER_HEIGHT}px`,
          height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
          py: '0.75rem',
          px: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {children}
    </Drawer>
  );
};
