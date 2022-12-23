import React from 'react';
import { Button, Box, Typography, useTheme, useMediaQuery } from '@mui/material';

import { useHelpContext } from 'src/hooks/useHelp';
import { useModalContext } from 'src/hooks/useModal';

export function ConfirmationHelpModalContent() {
  const { setPagination, setClickAway, pagination, helpTourAsset } = useHelpContext();
  const { close, openSupplyHelp, openSupply } = useModalContext();
  const { breakpoints } = useTheme();

  const md = useMediaQuery(breakpoints.down('md'));

  const handleClose = () => {
    close();
    setClickAway(true);
    setPagination(8);
  };

  const handleClickTour = () => {
    close();
    md && pagination['SupplyTour'] !== 9 && openSupplyHelp();
    !md && pagination['SupplyTour'] !== 9 && openSupply(helpTourAsset);
    pagination['SupplyTour'] === 9 && setPagination(1);
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
