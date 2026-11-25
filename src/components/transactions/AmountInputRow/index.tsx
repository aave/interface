import { XCircleIcon } from '@heroicons/react/solid';
import { Box, CircularProgress, IconButton, InputBase } from '@mui/material';
import React, { ReactNode } from 'react';
import NumberFormat, { NumberFormatProps } from 'react-number-format';

const ROW_HEIGHT = '2.25rem';

const amountInputSx = {
  flex: 1,
  minWidth: 0,
  color: 'fg-1',
  '& input::placeholder': { color: 'fg-4', opacity: 1 },
};

const amountInputStyle = {
  fontSize: '2.25rem',
  fontWeight: 500,
  lineHeight: ROW_HEIGHT,
  padding: 0,
  height: ROW_HEIGHT,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
} as const;

const amountLoadingSx = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  height: ROW_HEIGHT,
};

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value: string;
}

const NumberFormatCustom = React.forwardRef<NumberFormatProps, CustomProps>(
  function NumberFormatCustom(props, ref) {
    const { onChange, ...other } = props;

    return (
      <NumberFormat
        {...other}
        getInputRef={ref}
        onValueChange={(values) => {
          if (values.value !== props.value)
            onChange({
              target: {
                name: props.name,
                value: values.value || '',
              },
            });
        }}
        thousandSeparator
        isNumericString
        allowNegative={false}
      />
    );
  }
);

interface AmountInputRowProps {
  value: string;
  loading?: boolean;
  disabled?: boolean;
  disableInput?: boolean;
  maxValue?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  children: ReactNode;
}

export const AmountInputRow = ({
  value,
  loading,
  disabled,
  disableInput,
  maxValue,
  onChange,
  onClear,
  children,
}: AmountInputRowProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
    {loading ? (
      <Box sx={amountLoadingSx}>
        <CircularProgress color="inherit" size="16px" />
      </Box>
    ) : (
      <InputBase
        sx={amountInputSx}
        placeholder="0"
        disabled={disabled || disableInput}
        value={value}
        autoFocus
        onChange={(e) => {
          if (!onChange) return;
          if (Number(e.target.value) > Number(maxValue)) {
            onChange('-1');
          } else {
            onChange(e.target.value);
          }
        }}
        inputProps={{ 'aria-label': 'amount input', style: amountInputStyle }}
        // eslint-disable-next-line
        inputComponent={NumberFormatCustom as any}
      />
    )}
    {value !== '' && !disableInput && (
      <IconButton
        sx={{
          minWidth: 0,
          p: 0,
          zIndex: 1,
          color: 'fg-3',
          '&:hover': {
            color: 'fg-2',
          },
        }}
        onClick={() => (onClear ? onClear() : onChange?.(''))}
        disabled={disabled}
      >
        <XCircleIcon height={16} />
      </IconButton>
    )}
    {children}
  </Box>
);
