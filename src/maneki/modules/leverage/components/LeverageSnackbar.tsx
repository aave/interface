import CloseIcon from '@mui/icons-material/Close';
import { IconButton, Slide, SlideProps, SnackbarContent } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import * as React from 'react';
import { useLeverageContext } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

const LeverageSnackbar = () => {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [message, setMessage] = React.useState('');
  const { txStatus, setTxStatus } = useLeverageContext();
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
      // autoHideDuration={6000}
      TransitionComponent={SlideTransition}
    >
      <SnackbarContent
        // style={{
        //   backgroundColor: status === error ? 'background.'
        //   borderRadius: '8px',
        // }}
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
};

export default LeverageSnackbar;
