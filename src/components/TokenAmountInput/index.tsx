import { t, Trans } from '@lingui/macro';
import {
  Box,
  Button,
  ButtonBase,
  ListItemText,
  Menu,
  MenuItem,
  Skeleton,
  Typography,
} from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { ReactNode, useId, useState } from 'react';
import { ChevronDownIcon } from 'src/components/icons/ChevronDownIcon';
import { PercentIcon } from 'src/components/icons/PercentIcon';
import { TypeSwapArrowsIcon } from 'src/components/icons/TypeSwapArrowsIcon';
import { FormattedNumber, getCompactDecimals } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { endIconSizeSx } from 'src/utils/buttonStyles';
import { figVars } from 'src/utils/figmaColors';
import { motion } from 'src/utils/motion';

const DECIMAL_INPUT_REGEX = /^(\d+(\.\d*)?|\.\d*)?$/;

const ROW_SX = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
} as const;

const ROOT_SX = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  p: '1rem 1.25rem',
} as const;
const LABEL_ROW_SX = { ...ROW_SX, minHeight: '1.375rem' } as const;
const AMOUNT_ROW_SX = { ...ROW_SX, gap: '1rem' } as const;
const FOOTER_ROW_SX = { ...AMOUNT_ROW_SX, minHeight: '1.375rem' } as const;
const BALANCE_SX = { display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 } as const;
const BALANCE_DIVIDER_SX = {
  width: '1px',
  height: '0.5rem',
  flexShrink: 0,
  bgcolor: 'border-1',
} as const;

const TEXT_BUTTON_SX = {
  typography: 'h5',
  whiteSpace: 'nowrap',
  transition: `color ${motion.duration.hover}ms ${motion.easing.standard}`,
  '&:hover': { color: 'fg-2' },
  '&.Mui-focusVisible': { outline: '2px solid currentColor', outlineOffset: '2px' },
} as const;

const FIELD_SX = {
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  gap: '0.25rem',
  flex: '1 1 0',
  minWidth: 0,
  fontSize: '2.25rem',
  fontWeight: 500,
  lineHeight: 1,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '2rem',
    background: `linear-gradient(270deg, ${figVars['table-bg']} 5%, transparent 100%)`,
    pointerEvents: 'none',
    transition: `transform ${motion.duration.hover}ms ease-out`,
    transformOrigin: 'right center',
  },
  '&[data-caret-at-end="true"]::after': { transform: 'scaleX(0)' },
} as const;

const FIELD_ACTIVE_SX = { ...FIELD_SX, color: 'fg-1' } as const;
const FIELD_INERT_SX = { ...FIELD_SX, color: 'fg-3' } as const;

const INPUT_SX = {
  display: 'block',
  width: '100%',
  height: '2.25rem',
  m: 0,
  p: 0,
  border: 'none',
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  lineHeight: 'inherit',
  '&:focus': { outline: 'none' },
  '&::placeholder': { color: 'fg-4', opacity: 1 },
  '&:disabled': { color: 'fg-3', opacity: 1 },
} as const;

const TOKEN_CHIP_SX = {
  flexShrink: 0,
  '& .MuiButton-endIcon': { color: 'fg-chevron' },
  ...endIconSizeSx('1.125rem'),
} as const;

const STATIC_TOKEN_CHIP_SX = { ...TOKEN_CHIP_SX, pointerEvents: 'none' } as const;

const CHEVRON = <ChevronDownIcon sx={{ '& path': { strokeWidth: 1.2 } }} />;

const SWAP_ICON = <TypeSwapArrowsIcon sx={{ fontSize: '1.25rem' }} />;

const FIAT_TOGGLE_SX = {
  ...TEXT_BUTTON_SX,
  gap: '0.375rem',
  color: 'fg-3',
  '& [data-readout]::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '0.125rem',
    height: '1px',
    backgroundColor: 'currentColor',
    opacity: 0,
    transition: `opacity ${motion.duration.hover}ms ${motion.easing.standard}`,
  },
  '&:hover [data-readout]::after': { opacity: 1 },
} as const;

const MAX_BUTTON_SX = {
  ...TEXT_BUTTON_SX,
  color: 'fg-1',
  '&.Mui-disabled': { color: 'fg-3' },
} as const;

const PERCENT_BUTTON_SX = { ...TEXT_BUTTON_SX, color: 'fg-3' } as const;

const PERCENT_MENU_PAPER = { sx: { '&&': { mt: 0 } } } as const;
const PERCENT_MENU_LIST = { sx: { display: 'flex' } } as const;

const PERCENTS = [25, 50, 75];

const PercentPicker = ({
  max,
  value,
  decimals,
  onPick,
}: {
  max: BigNumber;
  value: BigNumber | null;
  decimals: number;
  onPick: (amount: BigNumber) => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <ButtonBase
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label={t`Percentage of available balance`}
        aria-haspopup="true"
        aria-expanded={open}
        sx={PERCENT_BUTTON_SX}
      >
        <PercentIcon />
      </ButtonBase>
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: PERCENT_MENU_PAPER }}
        MenuListProps={PERCENT_MENU_LIST}
      >
        {PERCENTS.map((percent) => {
          const amount = max.times(percent).div(100).decimalPlaces(decimals, BigNumber.ROUND_DOWN);

          return (
            <MenuItem
              key={percent}
              disabled={!!value?.eq(amount)}
              onClick={() => {
                onPick(amount);
                setAnchorEl(null);
              }}
            >
              <ListItemText sx={{ fontWeight: 500 }}>{percent}%</ListItemText>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

const decimalPlacesForSignificantDigit = (value: number) =>
  value === 0 ? 0 : Math.max(0, -Math.floor(Math.log10(Math.abs(value))) + 1);

export interface TokenAmountInputToken {
  symbol: string;
  decimals: number;
  iconSymbol?: string;
}

export interface TokenAmountInputProps {
  title?: ReactNode;
  titleAction?: ReactNode;
  label?: ReactNode;
  value: BigNumber | null;
  onValueChange?: (value: BigNumber | null) => void;
  token: TokenAmountInputToken;
  onChangeToken?: () => void;
  fiatRate: number;
  hideFiat?: boolean;
  max?: BigNumber;
  allowExceedMax?: boolean;
  maxLabel?: ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
}

export const TokenAmountInput = ({
  title,
  titleAction,
  label,
  value,
  onValueChange,
  token,
  onChangeToken,
  fiatRate,
  hideFiat,
  max,
  allowExceedMax = false,
  maxLabel,
  isLoading,
  disabled,
  readOnly,
  autoFocus = true,
}: TokenAmountInputProps) => {
  const inputId = `input-${useId()}`;
  const [rawInput, setRawInput] = useState('');
  const [caretAtEnd, setCaretAtEnd] = useState(false);
  const [showFiat, setShowFiat] = useState(false);
  const inert = disabled || readOnly;
  const tokenFixed = disabled || !onChangeToken;
  const fiat = !hideFiat && showFiat;

  const syncCaretAtEnd = (input: HTMLInputElement) => {
    const { selectionStart, selectionEnd, value } = input;
    setCaretAtEnd(
      selectionStart !== null && selectionStart === selectionEnd && selectionEnd === value.length
    );
  };

  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (rawInput && value) {
      const raw = new BigNumber(rawInput);
      const rawAmount = fiat ? raw.div(fiatRate) : raw;
      if (!raw.isNaN() && !rawAmount.eq(value)) {
        setRawInput('');
      }
    }
  }

  const tokenValue = value ?? new BigNumber(0);
  const fiatValue = tokenValue.times(fiatRate);
  const displayValue = (
    fiat ? fiatValue.decimalPlaces(2) : tokenValue.decimalPlaces(token.decimals)
  ).toFixed();

  const maxDecimals =
    max && !max.eq(0) && max.lt(0.01) ? decimalPlacesForSignificantDigit(max.toNumber()) : 2;

  const handleInputChange = (input: HTMLInputElement) => {
    const next = input.value;
    syncCaretAtEnd(input);

    if (!DECIMAL_INPUT_REGEX.test(next)) return;

    const dotIndex = next.indexOf('.');
    if (dotIndex !== -1 && next.length - dotIndex - 1 > (fiat ? 2 : token.decimals)) return;

    setRawInput(next);

    if (next === '' || next === '.' || (fiat && fiatRate === 0)) {
      onValueChange?.(null);
      return;
    }

    const typed = new BigNumber(next);
    const amount = fiat ? typed.div(fiatRate) : typed;
    if (!allowExceedMax && max && amount.gt(max)) {
      setRawInput('');
      onValueChange?.(max);
      return;
    }

    onValueChange?.(amount);
  };

  const handleBlur = () => {
    setRawInput('');
    setCaretAtEnd(false);
  };

  return (
    <Box sx={ROOT_SX}>
      {title && (
        <Box sx={LABEL_ROW_SX}>
          <Typography component="label" htmlFor={inputId} variant="base" color="fg-3">
            {title}
          </Typography>
          {titleAction}
        </Box>
      )}

      <Box sx={AMOUNT_ROW_SX}>
        <Box
          data-caret-at-end={caretAtEnd || undefined}
          sx={inert ? FIELD_INERT_SX : FIELD_ACTIVE_SX}
        >
          {fiat && '$'}
          <Box
            component="input"
            id={inputId}
            type="text"
            placeholder="0"
            disabled={inert}
            autoFocus={autoFocus}
            value={rawInput || (value ? displayValue : '')}
            onChange={(event) => handleInputChange(event.target)}
            onBlur={handleBlur}
            onFocus={(event) => syncCaretAtEnd(event.target)}
            onClick={(event) => syncCaretAtEnd(event.currentTarget)}
            onKeyUp={(event) => syncCaretAtEnd(event.currentTarget)}
            onSelect={(event) => syncCaretAtEnd(event.currentTarget)}
            inputMode="decimal"
            aria-label="amount"
            sx={INPUT_SX}
          />
        </Box>

        <Button
          variant="tertiary"
          onClick={tokenFixed ? undefined : onChangeToken}
          tabIndex={tokenFixed ? -1 : undefined}
          aria-haspopup={tokenFixed ? undefined : 'dialog'}
          startIcon={<TokenIcon symbol={token.iconSymbol ?? token.symbol} />}
          endIcon={tokenFixed ? undefined : CHEVRON}
          sx={tokenFixed ? STATIC_TOKEN_CHIP_SX : TOKEN_CHIP_SX}
        >
          {token.symbol}
        </Button>
      </Box>

      {(!hideFiat || max) && (
        <Box sx={FOOTER_ROW_SX}>
          {hideFiat ? (
            <div />
          ) : isLoading ? (
            <Skeleton
              variant="rectangular"
              width={60}
              height={16}
              sx={{ borderRadius: '0.25rem' }}
            />
          ) : (
            <ButtonBase onClick={() => setShowFiat(!fiat)} disabled={inert} sx={FIAT_TOGGLE_SX}>
              {SWAP_ICON}
              <FormattedNumber
                data-readout
                component="span"
                variant="inherit"
                color="inherit"
                {...(fiat
                  ? {
                      value: tokenValue.toString(),
                      visibleDecimals: getCompactDecimals(tokenValue, fiatRate),
                      symbol: token.symbol,
                    }
                  : { value: fiatValue.toString(), symbol: 'USD' })}
              />
            </ButtonBase>
          )}

          {max && (
            <Box sx={BALANCE_SX}>
              <Typography variant="base" color="fg-3" noWrap>
                {label ?? <Trans>Balance</Trans>}:{' '}
                <FormattedNumber
                  component="span"
                  variant="inherit"
                  color="inherit"
                  {...(fiat
                    ? { value: max.times(fiatRate).toString(), symbol: 'USD' }
                    : { value: max.toString(), visibleDecimals: maxDecimals, compact: false })}
                />
              </Typography>
              {!inert && (
                <>
                  <Box sx={BALANCE_DIVIDER_SX} />
                  <PercentPicker
                    max={max}
                    value={value}
                    decimals={token.decimals}
                    onPick={(amount) => onValueChange?.(amount)}
                  />
                  <ButtonBase
                    onClick={() => onValueChange?.(max)}
                    disabled={!!value?.eq(max)}
                    sx={MAX_BUTTON_SX}
                  >
                    {maxLabel ?? <Trans>Max</Trans>}
                  </ButtonBase>
                </>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
