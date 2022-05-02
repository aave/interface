import { Trans } from '@lingui/macro';
import { Box, Typography, Modal, Paper, Button, Divider, SvgIcon } from '@mui/material';
import Paraswap from '/public/icons/other/paraswap.svg';
import React from 'react';

type SlippageModalProps = {
  open: boolean;
  value: string;
  setOpen: (open: boolean) => void;
  setSlippage: (value: string) => void;
};

export function SlippageModal({ open, setOpen, value, setSlippage }: SlippageModalProps) {
  const handleClose = () => setOpen(false);
  const values: string[] = ['0.1', '0.5', '1'];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        '.MuiPaper-root': {
          outline: 'none',
        },
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      data-cy={'Modal'}
    >
      <Paper
        sx={{
          position: 'relative',
          overflowY: 'auto',
          width: '100%',
          maxWidth: `220px`,
          maxHeight: 'calc(100vh - 20px)',
        }}
      >
        <Box sx={{ px: '16px', py: '12px' }}>
          <Typography variant="secondary12" color="text.secondary">
            <Trans>Select slippage tolerance</Trans>
          </Typography>
        </Box>

        {values.map((slippageValue) => {
          const selected = slippageValue === value;

          return (
            <Button
              variant="text"
              key={slippageValue}
              onClick={() => setSlippage(slippageValue)}
              sx={{ width: '100%', p: 0 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  px: '16px',
                  py: '12px',
                  width: '100%',
                }}
              >
                <Typography variant="subheader1">{slippageValue}%</Typography>

                {selected && <Typography variant="subheader1">&#10004;</Typography>}
              </Box>
            </Button>
          );
        })}

        <Divider />
        <Box sx={{ px: '16px', py: '12px', display: 'inline-flex', alignItems: 'center' }}>
          <Typography
            variant="secondary12"
            color="text.secondary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <Trans>Powered by</Trans>
            <SvgIcon
              sx={{
                fontSize: '20px',
                width: '20px',
                color: '#2669F5',
                position: 'relative',
                top: '5px',
                left: '5px',
              }}
            >
              <Paraswap />
            </SvgIcon>
          </Typography>
          <Typography variant="main12" color="text.secondary">
            Paraswap
          </Typography>
        </Box>
      </Paper>
    </Modal>
  );
}
