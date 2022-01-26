import { Close } from '@mui/icons-material';
import { Box, Dialog, DialogProps, IconButton, Paper, PaperProps, Typography } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

export interface AaveModalProps extends DialogProps {
  title: string;
  tokenSymbol?: string;
}

export const AavePaperBox = styled(Paper)(({ theme }) => ({
  '&': {
    width: '100%',
    maxWidth: '400px',
    minHeight: '480px',
    background: theme.palette.background,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
    borderRadius: '4px',
    padding: '24px',
  },
})) as React.JSXElementConstructor<PaperProps>;

export const AaveModal = (props: AaveModalProps) => {
  const onCloseAction = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
    props.onClose && props.onClose(e, 'backdropClick');

  return (
    <Dialog PaperComponent={AavePaperBox} aria-labelledby="aave-modal-title" {...props}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '26px' }}>
        <Typography id="aave-modal-title" variant="h2">
          {props.title} {props.tokenSymbol ? props.tokenSymbol : ''}
        </Typography>
        <IconButton aria-label="close" onClick={onCloseAction} sx={{ padding: 0 }}>
          <Close />
        </IconButton>
      </Box>
      {props.children}
    </Dialog>
  );
};
