import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { useModalContext } from 'src/hooks/useModal';

import { uiConfig } from '../../uiConfig';

export default function HelpModalContent() {
  const { close } = useModalContext();

  const handleClose = () => {
    localStorage.setItem('Supply Tour', 'true');
    close();
  };

  const handleClickTour = () => {
    localStorage.setItem(`Supply Tour`, 'false');
    close();
  };

  return (
    <Box>
      <Box sx={{ mb: '30px' }}>
        <img
          src={uiConfig.helpImage}
          alt="Image of a dashboard"
          style={{ width: '100%', height: 'auto' }}
        />
      </Box>
      <Box>
        <Typography sx={{ fontSize: '24px', fontWeight: 500, lineHeight: '34px' }}>
          Take a quick tour?
        </Typography>
        <Typography sx={{ mt: '15px' }}>
          Get familiar with AAVE and learn how supplies and borrows work in just fourteen steps.
        </Typography>
        <Box
          sx={{
            mt: { xs: '25px', xsm: '40px' },
            display: 'flex',
            justifyContent: 'flex-end',
            flexDirection: { xs: 'column', xsm: 'row' },
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ width: { xs: '100%', xsm: '110px' } }}
          >
            No, Thanks
          </Button>
          <Button
            variant="contained"
            onClick={handleClickTour}
            sx={{
              ml: { xs: 0, xsm: '10px' },
              mt: { xs: '15px', xsm: 0 },
              width: { xs: '100%', xsm: '110px' },
            }}
          >
            Take tour
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
