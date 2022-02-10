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
      anchor="right"
      open={open}
      onClose={() => setOpen(false)}
      hideBackdrop
      sx={{ top: `${headerHeight}px` }}
      PaperProps={{
        sx: {
          background: 'rgba(0, 14, 31, 0.88)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderRadius: 'unset',
          width: '100%',
          top: `${headerHeight}px`,
          pt: 6,
          pb: 15,
        },
      }}
    >
      {children}
    </Drawer>
  );
};
