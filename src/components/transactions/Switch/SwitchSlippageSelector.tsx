import { CogIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  InputAdornment,
  InputBase,
  Menu,
  SvgIcon,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { MouseEvent, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Warning } from 'src/components/primitives/Warning';

import { ValidationData } from './SwitchModalContent';

const DEFAULT_SLIPPAGE_OPTIONS = ['0.10', '0.50', '1.00'];

type SwitchSlippageSelectorProps = {
  slippage: string;
  setSlippage: (value: string) => void;
  slippageValidation?: ValidationData;
};

export const SwitchSlippageSelector = ({
  slippage,
  setSlippage,
  slippageValidation,
}: SwitchSlippageSelectorProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>();
  const [isCustomSlippage, setIsCustomSlippage] = useState(false);

  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCustomSlippageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSlippage(event.target.value);
    setIsCustomSlippage(true);
  };

  const handlePresetSlippageChange = (value: string) => {
    setSlippage(value);
    setIsCustomSlippage(false);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" color="text.secondary">
        <Trans>Slippage</Trans>
        <Menu
          sx={{
            maxWidth: '330px',
          }}
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
          <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', gap: '8px' }}>
            <ToggleButtonGroup
              sx={{
                backgroundColor: 'background.surface',
                borderRadius: '6px',
                borderColor: 'background.surface',
              }}
              exclusive
              onChange={(_, value) => handlePresetSlippageChange(value)}
            >
              {DEFAULT_SLIPPAGE_OPTIONS.map((option) => (
                <ToggleButton
                  sx={{
                    borderRadius: 1,
                    py: 1,
                    px: 2,
                    borderWidth: 2,
                    backgroundColor:
                      option === slippage && !isCustomSlippage ? 'background.paper' : 'transparent',
                  }}
                  value={option}
                  key={option}
                >
                  <FormattedNumber
                    value={option}
                    visibleDecimals={2}
                    symbol="%"
                    variant="subheader2"
                    color="primary.main"
                    symbolsColor="primary.main"
                  />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <InputBase
              type="percent"
              value={isCustomSlippage ? slippage : ''}
              onChange={handleCustomSlippageChange}
              placeholder="Custom"
              endAdornment={
                <InputAdornment position="end">
                  <Typography variant="caption" color="text.muted">
                    %
                  </Typography>
                </InputAdornment>
              }
              sx={{
                fontSize: '12px',
                px: 2,
                width: '120px',
                border: 1,
                borderWidth: '1px',
                backgroundColor: 'background.surface',
                borderColor: slippageValidation
                  ? `${slippageValidation.severity}.main`
                  : 'background.surface',
                borderRadius: '4px',
              }}
            />
          </Box>
          {slippageValidation && (
            <Warning sx={{ mb: 0, mt: 2 }} severity={slippageValidation.severity}>
              {slippageValidation.message}
            </Warning>
          )}
        </Menu>
      </Typography>
      <FormattedNumber
        variant="caption"
        color={slippageValidation ? `${slippageValidation.severity}.main` : 'text.primary'}
        value={slippage}
        visibleDecimals={2}
        symbol="%"
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
