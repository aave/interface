import { Trans } from '@lingui/macro';
import { Box, OutlinedInput, Slider, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { NumberFormatCustom } from 'src/components/transactions/AssetInput';

const sliderStyles = {
  color: '#669AFF',
  marginBottom: '8px',
  '.MuiSlider-rail': {
    color: 'text.disabled',
  },
  '.MuiSlider-thumb': {
    boxShadow:
      '0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 1px 5px rgba(0, 0, 0, 0.12)',
  },
  '.MuiSlider-mark': {
    display: 'none',
  },
  '.MuiSlider-markLabel': {
    top: '24px',
    fontSize: '10px',
    color: 'text.secondary',
    '&[data-index="1"]': {
      transform: 'translateX(-100%)',
    },
    '@media (pointer: coarse)': {
      top: '30px',
    },
  },
};

interface CalculatorInputProps {
  title: string;
  value: number | null;
  disabled: boolean;
  tokenSymbol: 'stkAAVE' | 'GHO';
  sliderMax: number;
  sliderMin?: number;
  downToXsm: boolean;
  onValueChanged: (value: number | null) => void;
}

export const CalculatorInput = ({
  title,
  value,
  disabled,
  tokenSymbol,
  sliderMax,
  sliderMin = 0,
  onValueChanged,
}: CalculatorInputProps) => {
  const [toolTipVisible, setToolTipVisible] = useState(false);

  let formattedValue = value;
  if (value && value % 1 !== 0) {
    formattedValue = parseFloat(value.toFixed(2));
  }

  const maxValueReached = formattedValue === sliderMax;

  useEffect(() => {
    if (maxValueReached) {
      setToolTipVisible(true);

      const timeout = setTimeout(() => {
        setToolTipVisible(false);
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
    } else {
      setToolTipVisible(false);
    }
  }, [maxValueReached]);

  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant="subheader2" gutterBottom>
        <Trans>{title}</Trans>
      </Typography>
      <OutlinedInput
        disabled={disabled}
        fullWidth
        value={formattedValue}
        placeholder="0"
        endAdornment={<TokenIcon symbol={tokenSymbol} />}
        inputProps={{
          min: 0,
          sx: { py: 2, px: 3, fontSize: '21px' },
        }}
        onChange={(e) =>
          e.target.value === '' || Number(e.target.value) <= 0
            ? onValueChanged(null)
            : onValueChanged(Number(e.target.value))
        }
        onBlur={(e) => {
          if (e.target.value === '' || Number(e.target.value) <= 0) {
            onValueChanged(sliderMin);
          }
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputComponent={NumberFormatCustom as any}
      />
      <Slider
        disabled={disabled}
        size="small"
        value={value ?? 0}
        onChange={(_, val) => onValueChanged(Number(val))}
        step={5}
        min={sliderMin}
        max={sliderMax}
        marks={[
          {
            value: sliderMin,
            label: new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 0,
              minimumFractionDigits: 0,
            }).format(sliderMin),
          },
          {
            value: sliderMax,
            label: new Intl.NumberFormat('en-US', {
              maximumFractionDigits: 0,
              minimumFractionDigits: 0,
            }).format(sliderMax),
          },
        ]}
        sx={sliderStyles}
      />
      <Tooltip
        sx={{
          position: 'absolute',
          bottom: 25,
          right: 0,
        }}
        open={toolTipVisible}
        placement="top"
        title={
          <Box sx={{ width: 150, textAlign: 'center' }}>
            <Trans>You may enter a custom amount in the field.</Trans>
          </Box>
        }
      >
        <Box />
      </Tooltip>
    </Box>
  );
};
