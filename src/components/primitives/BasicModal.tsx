import React from 'react';
import { XIcon } from '@heroicons/react/solid';
import { Box, IconButton, Modal, Paper, SvgIcon } from '@mui/material';

export interface BasicModalProps {
  open: boolean;
  children: React.ReactNode;
  setOpen: (value: boolean) => void;
  withCloseButton?: boolean;
  contentMaxWidth?: number;
}

export const BasicModal = ({
  open,
  setOpen,
  withCloseButton = true,
  contentMaxWidth = 400,
  children,
  ...props
}: BasicModalProps) => {
  const handleClose = () => setOpen(false);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '.MuiPaper-root': {
          outline: 'none',
        },
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      {...props}
    >
      <Paper
        sx={{
          position: 'relative',
          margin: '10px',
          overflowY: 'auto',
          maxWidth: `${contentMaxWidth}px`,
          maxHeight: 'calc(100vh - 20px)',
          minWidth: {
            xs: '0px',
            sm: '400px',
          },
          minHeight: {
            xs: '0px',
            sm: '372px',
          },
          p: 6,
        }}
      >
        {children}

        {withCloseButton && (
          <Box sx={{ position: 'absolute', top: '24px', right: '24px', zIndex: 5 }}>
            <IconButton sx={{ borderRadius: '50%', p: 0, minWidth: 0 }} onClick={handleClose}>
              <SvgIcon>
                <XIcon />
              </SvgIcon>
            </IconButton>
          </Box>
        )}
      </Paper>
    </Modal>
  );
};
