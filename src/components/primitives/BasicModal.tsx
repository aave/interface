import { Box, IconButton, Modal, Paper } from '@mui/material';
import React from 'react';

import { CloseIcon } from '../icons/CloseIcon';

export interface BasicModalProps {
  open: boolean;
  children: React.ReactNode;
  setOpen: (value: boolean) => void;
  withCloseButton?: boolean;
  contentMaxWidth?: number;
  minContentHeight?: number;
  contentHeight?: number;
  closeCallback?: () => void;
  disableEnforceFocus?: boolean;
  BackdropProps?: object;
}

export const BasicModal = ({
  open,
  setOpen,
  withCloseButton = true,
  contentMaxWidth = 420,
  minContentHeight,
  contentHeight,
  children,
  closeCallback,
  disableEnforceFocus,
  BackdropProps,
  ...props
}: BasicModalProps) => {
  const handleClose = () => {
    if (closeCallback) closeCallback();
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      disableEnforceFocus={disableEnforceFocus} // Used for wallet modal connection
      BackdropProps={BackdropProps}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '.MuiPaper-root': {
          outline: 'none',
        },
        '.MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.32)',
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      {...props}
      data-cy={'Modal'}
    >
      <Paper
        variant="modal"
        sx={{
          position: 'relative',
          margin: '10px',
          overflowY: 'auto',
          width: '100%',
          maxWidth: { xs: '359px', xsm: `${contentMaxWidth}px` },
          height: contentHeight ? `${contentHeight}px` : 'auto',
          maxHeight: contentHeight ? `${contentHeight}px` : 'calc(100vh - 20px)',
          p: 6,
        }}
      >
        {children}

        {withCloseButton && (
          <Box sx={{ position: 'absolute', top: '24px', right: '50px', zIndex: 5 }}>
            <IconButton
              sx={{
                borderRadius: '50%',
                p: 0,
                minWidth: 0,
                position: 'absolute',
                '&:hover': { backgroundColor: 'transparent' },
              }}
              onClick={handleClose}
              data-cy={'close-button'}
            >
              <CloseIcon
                data-cy={'CloseModalIcon'}
                sx={(theme) => ({ fontSize: '24px', color: theme.palette.fig['fg-3'] })}
              />
            </IconButton>
          </Box>
        )}
      </Paper>
    </Modal>
  );
};
