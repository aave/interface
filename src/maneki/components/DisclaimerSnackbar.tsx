import { Link, Paper, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import * as React from 'react';

const DisclaimerSnackbar = () => {
  const [open, setOpen] = React.useState(true);

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleAgree = () => {
    sessionStorage.setItem('disclaimerAgreement', 'true');
    setOpen(false);
  };

  React.useEffect(() => {
    const seshValue = sessionStorage.getItem('disclaimerAgreement');

    if (seshValue === 'true') setOpen(false);
    else setOpen(true);
  }, []);
  return (
    <Snackbar open={open} onClose={handleClose}>
      <Paper
        sx={{
          padding: '12px',
          maxWidth: '300px',
        }}
      >
        <Typography>
          The website is a community deployed and maintained instance of the Maneki front end,
          hosted and served on the distributed, peer-to-peer IPFS network.
        </Typography>
        <Typography sx={{ mt: '8px' }}>
          Alternative links can be found in the{' '}
          <Link href="https://docs.maneki.finance/">docs</Link>.
        </Typography>
        <Typography sx={{ mt: '8px' }}>
          By clicking Agree you accept the <Link href="https://docs.maneki.finance/">T&Cs</Link>
        </Typography>
        <Button
          sx={{
            padding: '8px',
            width: '100%',
            textAlign: 'center',
            mt: '12px',
          }}
          variant="contained"
          onClick={handleAgree}
        >
          Agree
        </Button>
      </Paper>
    </Snackbar>
  );
};

export default DisclaimerSnackbar;
