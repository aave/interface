import { Close } from '@mui/icons-material';
import { Box, Dialog, DialogProps, IconButton, Paper, PaperProps, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

export interface AaveModalProps extends DialogProps {
  title: string;
}

export const AavePaperBox = styled(Paper)(({ theme }) => ({
  '&': {
    width: '100%',
    maxWidth: '468px',
    minHeight: '512px',
    background: theme.palette.background,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '4px',
    padding: '24px',
  },
})) as React.JSXElementConstructor<PaperProps>;

export const ModalTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: 'bold',
  fontSize: '21px',
  lineHeight: '26px',
  color: theme.palette.primary,
}));

export const AaveModal = (props: AaveModalProps) => {
  const onCloseAction = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
    props.onClose && props.onClose(e, 'backdropClick');

  return (
    <Dialog PaperComponent={AavePaperBox} aria-labelledby="aave-modal-title" {...props}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '43px' }}>
        <ModalTitle id="aave-modal-title" variant="h6">
          {props.title}
        </ModalTitle>
        <IconButton aria-label="close" onClick={onCloseAction} sx={{ padding: 0 }}>
          <Close />
        </IconButton>
      </Box>
      {props.children}
    </Dialog>
  );
};
