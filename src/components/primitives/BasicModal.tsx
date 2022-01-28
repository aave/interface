import { XIcon } from '@heroicons/react/solid';
import { Box, IconButton, Modal, Paper, SvgIcon } from '@mui/material';
import { ReactNode } from 'react';

interface BasicModalProps {
  open: boolean;
  children: ReactNode;
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
    >
      <Paper
        sx={{
          position: 'relative',
          margin: '10px',
          overflowY: 'auto',
          maxWidth: `${contentMaxWidth}px`,
          maxHeight: 'calc(100vh - 20px)',
          p: 6,
        }}
      >
        {children}

        {withCloseButton && (
          <Box sx={{ position: 'absolute', top: '10px', right: '30px', zIndex: 5 }}>
            <IconButton
              sx={{ borderRadius: '50%', p: 0, minWidth: 0, position: 'fixed' }}
              onClick={handleClose}
            >
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
