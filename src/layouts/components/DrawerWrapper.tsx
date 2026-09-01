import { Drawer } from '@mui/material';
import { ReactNode } from 'react';

interface DrawerWrapperProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  headerHeight: number;
  children: ReactNode;
}

export const DrawerWrapper = ({ open, setOpen, children, headerHeight }: DrawerWrapperProps) => {
  return (
    <Drawer
      data-cy={`mobile-menu`}
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      hideBackdrop
      disableScrollLock
      sx={{ top: `${headerHeight}px` }}
      PaperProps={{
        sx: {
          bgcolor: 'bg-1',
          boxShadow: 'none',
          borderRadius: 'unset',
          width: '100%',
          top: `${headerHeight}px`,
          height: `calc(100dvh - ${headerHeight}px)`,
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
