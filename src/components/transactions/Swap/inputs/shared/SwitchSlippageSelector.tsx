import { CogIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  InputBase,
  Menu,
  SvgIcon,
  Typography,
} from '@mui/material';
import { MouseEvent, useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';

import { ValidationData } from '../../helpers/shared/slippage.helpers';

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
    return ['0.03', '0.07', 'Auto'];
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
  }, [slippage, suggestedSlippage, userHasSetCustomSlippage, isCustomSlippage, previousSlippage]);

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
      <Typography variant="subheader2" color="fg-2" sx={{ opacity: 0.75 }}>
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
            <StyledTxModalToggleGroup
              value={suggestedSlippage === slippage ? 'Auto' : slippage}
              exclusive
              onChange={(_, value) => value && handlePresetSlippageChange(value)}
              // Compact menu footprint, sized to the custom-slippage input beside it; the
              // shell/pill treatment comes from the shared control.
              sx={{ width: 'auto', height: '28px' }}
            >
              {slippageOptions.map((option) => (
                <StyledTxModalToggleButton value={option} key={option}>
                  {isNaN(Number(option)) ? (
                    <Typography variant="subheader2">
                      {provider === 'paraswap' ? <Trans>Default</Trans> : <Trans>Auto</Trans>}
                    </Typography>
                  ) : (
                    <FormattedNumber
                      value={option}
                      visibleDecimals={2}
                      symbol="%"
                      variant="subheader2"
                    />
                  )}
                </StyledTxModalToggleButton>
              ))}
            </StyledTxModalToggleGroup>
            <InputBase
              type="percent"
              value={isCustomSlippage ? slippage : ''}
              onChange={handleCustomSlippageChange}
              placeholder="Custom"
              endAdornment={
                <InputAdornment position="end">
                  <Typography variant="caption" color="fg-3">
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
                backgroundColor: 'bg-2',
                borderColor: slippageValidation ? `${slippageValidation.severity}.main` : 'bg-2',
                borderRadius: '4px',
              }}
            />
          </Box>
          {slippageValidation && (
            <Alert sx={{ width: '100%', mb: 0, mt: 2 }} severity={slippageValidation.severity}>
              {slippageValidation.message}
            </Alert>
          )}
        </Menu>
      </Typography>
      <Button
        id="switch-slippage-selector-button"
        sx={{
          opacity: 0.85,
          py: 1,
          px: 1,
          minWidth: 0,
          '&:hover .spin-on-hover': {
            animation: 'spin 2s linear infinite',
          },
          '@keyframes spin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        }}
        onClick={handleOpen}
        aria-controls="switch-slippage-selector"
        disabled={!suggestedSlippage}
      >
        <FormattedNumber
          variant="caption"
          color={slippageValidation ? `${slippageValidation.severity}.main` : 'fg-1'}
          value={slippage}
          visibleDecimals={2}
          symbol="%"
        />
        <SvgIcon className="spin-on-hover" sx={{ fontSize: '16px' }}>
          <CogIcon />
        </SvgIcon>
      </Button>
    </Box>
  );
};
