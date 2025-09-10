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
import { MouseEvent, useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Warning } from 'src/components/primitives/Warning';

import { ValidationData } from './validation.helpers';

type SwitchSlippageSelectorProps = {
  suggestedSlippage?: string;
  slippage: string;
  setSlippage: (value: string) => void;
  slippageValidation?: ValidationData;
  provider?: string;
};

const defaultSlippageOptions = (suggested?: string) => {
  if (!suggested) {
    return ['0.10', '0.50', '2.0'];
  }

  const suggestedNumber = Number(suggested);
  if (suggestedNumber <= 0.1) {
    return ['0.20', '0.50', 'Auto'];
  }
  if (suggestedNumber < 1) {
    return ['0.10', '0.50', 'Auto'];
  }

  if (suggestedNumber < 3) {
    return ['1.00', '2.00', 'Auto'];
  }

  if (suggestedNumber < 5) {
    return ['2.00', '3.00', 'Auto'];
  }

  if (suggestedNumber < 10) {
    return ['3.00', '5.00', 'Auto'];
  }

  return ['5.00', '10.00', 'Auto'];
};

export const SwitchSlippageSelector = ({
  suggestedSlippage,
  slippage,
  setSlippage,
  slippageValidation,
  provider,
}: SwitchSlippageSelectorProps) => {
  const slippageOptions = defaultSlippageOptions(suggestedSlippage).map((option) => {
    if (Number(option) === Number(suggestedSlippage)) {
      return (Number(option) - 0.25).toString();
    }
    return option;
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>();
  const [isCustomSlippage, setIsCustomSlippage] = useState(false);
  const [previousSlippage, setPreviousSlippage] = useState(slippage);
  const [userHasSetCustomSlippage, setUserHasSetCustomSlippage] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    // Watch for slippage changes from outside the component
    if (previousSlippage !== slippage) {
      if (!userHasSetCustomSlippage) {
        setIsCustomSlippage(false);
        setPreviousSlippage(slippage);
      } else {
        setSlippage(previousSlippage);
        return;
      }
    }

    // Update slippage to suggested if user has not set custom slippage
    if (suggestedSlippage && !userHasSetCustomSlippage && !isCustomSlippage) {
      setSlippage(suggestedSlippage);
      setPreviousSlippage(slippage);
    }
  }, [
    slippage,
    suggestedSlippage,
    userHasSetCustomSlippage,
    isCustomSlippage,
    previousSlippage,
    setSlippage,
  ]);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCustomSlippageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreviousSlippage(event.target.value);
    setSlippage(event.target.value);
    setUserHasSetCustomSlippage(true);
    setIsCustomSlippage(true);
  };

  const handlePresetSlippageChange = (value: string) => {
    if (value === 'Auto' && suggestedSlippage) {
      setPreviousSlippage(suggestedSlippage);
      setSlippage(suggestedSlippage);
      setIsCustomSlippage(false);
      setUserHasSetCustomSlippage(false);
    } else {
      setPreviousSlippage(value);
      setSlippage(value);
      setIsCustomSlippage(true);
      setUserHasSetCustomSlippage(true);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: '4px' }}>
      <Typography variant="caption" color="text.secondary">
        {isCustomSlippage ? (
          <Trans>Custom slippage</Trans>
        ) : provider === 'paraswap' ? (
          <Trans>Default slippage</Trans>
        ) : (
          <Trans>Auto Slippage</Trans>
        )}
        {':'}
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
              {slippageOptions.map((option) => (
                <ToggleButton
                  sx={{
                    borderRadius: 1,
                    py: 1,
                    px: 2,
                    borderWidth: 2,
                    backgroundColor:
                      (suggestedSlippage === slippage && option == 'Auto') || option === slippage
                        ? 'background.paper'
                        : 'transparent',
                  }}
                  value={option}
                  key={option}
                >
                  {isNaN(Number(option)) ? (
                    <Typography variant="subheader2" color="primary.main">
                      {provider === 'paraswap' ? <Trans>Default</Trans> : <Trans>Auto</Trans>}
                    </Typography>
                  ) : (
                    <FormattedNumber
                      value={option}
                      visibleDecimals={2}
                      symbol="%"
                      variant="subheader2"
                      color="primary.main"
                      symbolsColor="primary.main"
                    />
                  )}
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
        disabled={!suggestedSlippage}
      >
        <SvgIcon sx={{ fontSize: '16px' }}>
          <CogIcon />
        </SvgIcon>
      </Button>
    </Box>
  );
};
