import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Slide, SlideProps, Snackbar, SnackbarContent } from '@mui/material';
import React from 'react';
import { ITxStatus } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface ClaimRewardSnackbarProps {
  txStatus: ITxStatus;
  setTxStatus: (value: ITxStatus) => void;
}

export default function ClaimRewardSnackbar({ txStatus, setTxStatus }: ClaimRewardSnackbarProps) {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [message, setMessage] = React.useState('');

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
    if (txStatus.status === '') return;
    setMessage(txStatus.message);
    setStatus(txStatus.status);
    setOpen(true);
    setTxStatus({
      status: '',
      message: '',
      hash: '',
    });
  }, [txStatus]);

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
