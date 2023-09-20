import { XIcon } from '@heroicons/react/outline';
import { Box, IconButton, Modal, Paper, SvgIcon } from '@mui/material';
import React from 'react';
import { useWalletModalContext } from 'src/hooks/useWalletModal';

import { WatchWalletSelector } from './WatchWalletSelector';

export interface BasicModalProps {
  open: boolean;
  children: React.ReactNode;
  setOpen: (value: boolean) => void;
  withCloseButton?: boolean;
  contentMaxWidth?: number;
}

export const CustomBasicModal = ({
  open,
  setOpen,
  withCloseButton = true,
  contentMaxWidth = 359,
  children,
  ...props
}: BasicModalProps) => {
  const handleClose = () => setOpen(false);
  return (
    <Modal
      open={open}
      onClose={handleClose}
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(71,88,107,0.24)',
        },
      }}
      sx={{
        display: 'flex',
        borderRadius: '20px',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

        '.MuiPaper-root': {
          outline: 'none',
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      {...props}
      data-cy={'Modal'}
    >
      <Paper
        sx={{
          background: 'rgb(255, 255, 255)',
          position: 'relative',
          borderRadius: '20px',
          fontFamily:
            '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
          margin: '10px',
          width: '100%',
          maxWidth: { xs: '359px', xsm: `${contentMaxWidth}px` },
          maxHeight: 'calc(100vh - 20px)',
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
                bgcolor: 'background.paper',
              }}
              onClick={handleClose}
              data-cy={'close-button'}
            >
              <SvgIcon sx={{ fontSize: '22px', color: 'text.primary' }}>
                <XIcon data-cy={'CloseModalIcon'} />
              </SvgIcon>
            </IconButton>
          </Box>
        )}
      </Paper>
    </Modal>
  );
};

export const WatchWalletModal = () => {
  const { isWalletModalOpen, setWalletModalOpen } = useWalletModalContext();

  return (
    <CustomBasicModal open={isWalletModalOpen} setOpen={setWalletModalOpen}>
      <WatchWalletSelector />
    </CustomBasicModal>
  );
};
