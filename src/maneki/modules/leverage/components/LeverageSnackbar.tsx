import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Paper, Slide, SlideProps, Typography } from '@mui/material';
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
  const { txStatus, setTxStatus, totalTxSteps } = useLeverageContext();
  const [currentTxSteps, setCurrentTxSteps] = React.useState(0);
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    void event;
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const action = (
    <IconButton size="small" aria-label="close" color="inherit" onClick={handleClose}>
      <CloseIcon />
    </IconButton>
  );
  React.useEffect(() => {
    if (txStatus.status === '') return;
    setMessage(txStatus.message);
    setStatus(txStatus.status);
    if (txStatus.status === 'approve' || txStatus.status === 'success')
      setCurrentTxSteps((prevState) => prevState + 1);
    if (txStatus.status === 'error') setCurrentTxSteps(0);
    setOpen(true);
    setTxStatus({
      status: '',
      message: '',
      hash: '',
    });
  }, [txStatus, totalTxSteps]);
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      autoHideDuration={status === 'error' ? 6000 : undefined}
      TransitionComponent={SlideTransition}
    >
      <Paper
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '420px',
          borderRadius: '4px',
        }}
      >
        <Box
          sx={{
            width: '100%',
            backgroundColor: '#e4e4e9',
            borderRadius: '4px 4px 0 0',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              borderRadius: '0 15px 15px 0',
              width:
                status === 'error' || status === 'success' ? '100%' : currentTxSteps / totalTxSteps,
              height: '14px',
              transition: 'all 0.5s ease-in-out',
              backgroundColor:
                status === 'error'
                  ? 'error.main'
                  : status === 'approve'
                  ? 'info.main'
                  : status === 'success'
                  ? 'success.main'
                  : 'info.main',
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0 8px',
            mt: '8px',
          }}
        >
          <Typography sx={{ fontWeight: '600', fontSize: '15px' }}>
            {status === 'error'
              ? `Transaction error`
              : status === 'success'
              ? `Transaction successful`
              : status === 'pending'
              ? `Confirmation pending`
              : `${currentTxSteps} / ${totalTxSteps} Transaction confirmed`}
          </Typography>
          {action}
        </Box>
        <Typography sx={{ padding: '8px', fontWeight: '500' }}>{message}</Typography>
      </Paper>
    </Snackbar>
  );
};

export default LeverageSnackbar;
