import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Slide, SlideProps, Snackbar, SnackbarContent } from '@mui/material';
import React from 'react';
import { useTxStateStore } from 'src/maneki/store/txStates';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export default function ClaimRewardSnackbar() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [message, setMessage] = React.useState('');
  const txState = useTxStateStore((state) => state.txState);
  const setTxState = useTxStateStore((state) => state.setTxState);
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    void event;
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const action = (
    <>
      <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
        <CloseIcon />
      </IconButton>
    </>
  );

  React.useEffect(() => {
    if (txState.status === '') return;
    setMessage(txState.message);
    setStatus(txState.status);
    setOpen(true);
    setTxState({
      status: '',
      message: '',
      hash: '',
    });
  }, [txState]);

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      autoHideDuration={6000}
      TransitionComponent={SlideTransition}
    >
      <SnackbarContent
        sx={{
          borderRadius: '8px',
          backgroundColor:
            status === 'error'
              ? 'error.main'
              : status === 'approve'
              ? 'info.main'
              : status === 'success'
              ? 'success.main'
              : '',
        }}
        message={message}
        action={action}
      />
    </Snackbar>
  );
}
