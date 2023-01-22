import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { useHelpContext } from 'src/hooks/useHelp';
import { useModalContext } from 'src/hooks/useModal';

export function ConfirmationHelpModalContent() {
  const { setPagination, setClickAway, pagination, helpTourAsset, tourInProgress } =
    useHelpContext();
  const { close, openMobileHelp, openSupply, openWithdraw } = useModalContext();
  const { breakpoints } = useTheme();

  const md = useMediaQuery(breakpoints.down('md'));

  const handleClose = () => {
    close();
    setClickAway(true);
    tourInProgress === 'Supply Tour' && setPagination(8);
    tourInProgress === 'Withdrawal Tour' && setPagination(7);
  };

  const handleClickTour = () => {
    close();
    switch (tourInProgress) {
      case 'Withdrawal Tour':
        !md && pagination['WithdrawTour'] !== 9 && openWithdraw(helpTourAsset);
        md && pagination['WithdrawTour'] !== 9 && openMobileHelp();
        pagination['WithdrawTour'] === 9 && setPagination(1);
        break;
      default:
        md && pagination['SupplyTour'] !== 9 && openMobileHelp();
        !md && pagination['SupplyTour'] !== 9 && openSupply(helpTourAsset);
        pagination['SupplyTour'] === 9 && setPagination(1);
        break;
    }
  };

  return (
    <Box>
      <Typography sx={{ fontSize: '24px', fontWeight: 500, lineHeight: '34px' }}>
        Are you sure you want to leave the tour?
      </Typography>
      <Typography sx={{ mt: '15px' }}>
        You can always start a new tour using the question mark icon at the top right corner.
      </Typography>
      <Box
        sx={{ mt: { xs: '15px', xsm: '20px' }, display: 'flex', justifyContent: 'space-between' }}
      >
        <Button
          variant="contained"
          onClick={handleClickTour}
          sx={{ width: '45%', borderRadius: '5px', p: '10px 9px' }}
        >
          Stay on the Tour
        </Button>
        <Button
          variant="outlined"
          onClick={handleClose}
          sx={{ width: '45%', borderRadius: '5px', p: '10px 9px' }}
        >
          Leave the Tour
        </Button>
      </Box>
    </Box>
  );
}
