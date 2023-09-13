import { CogIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Menu,
  SvgIcon,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { MouseEvent, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

const DEFAULT_SLIPPAGE_OPTIONS = ['0.001', '0.005', '0.01'];

type SwitchSlippageSelectorProps = {
  slippage: string;
  setSlippage: (value: string) => void;
};

export const SwitchSlippageSelector = ({ slippage, setSlippage }: SwitchSlippageSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>();

  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" color="text.secondary">
        <Trans>Slippage</Trans>
        <Menu
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          anchorEl={anchorEl}
          id="switch-slippage-selector"
          MenuListProps={{
            'aria-labelledby': 'switch-slippage-selector-button',
            sx: { py: 3, px: 4 },
          }}
          open={open}
          onClose={handleClose}
        >
          <Typography variant="subheader2" mb={5}>
            <Trans>Max slippage</Trans>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ToggleButtonGroup
              sx={{ backgroundColor: 'background.surface', borderRadius: '6px', p: '2px' }}
              exclusive
              onChange={(_, value) => setSlippage(value)}
            >
              {DEFAULT_SLIPPAGE_OPTIONS.map((option) => (
                <ToggleButton
                  sx={{
                    borderRadius: 1,
                    py: 1,
                    px: 2,
                    borderColor: 'transparent',
                    backgroundColor: option === slippage ? '#FFFFFF' : 'transparent',
                  }}
                  value={option}
                  key={option}
                >
                  <FormattedNumber
                    value={option}
                    percent
                    variant="subheader2"
                    color="primary.main"
                    symbolsColor="primary.main"
                  />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Menu>
      </Typography>
      <FormattedNumber
        variant="caption"
        color="text.primary"
        value={slippage}
        visibleDecimals={2}
        percent
      />
      <Button
        id="switch-slippage-selector-button"
        sx={{ padding: 0, minWidth: 0 }}
        onClick={handleOpen}
        aria-controls="switch-slippage-selector"
      >
        <SvgIcon sx={{ fontSize: '16px' }}>
          <CogIcon />
        </SvgIcon>
      </Button>
    </Box>
  );
};
