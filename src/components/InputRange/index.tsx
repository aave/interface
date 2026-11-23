import { Box, Slider } from '@mui/material';
import { memo, ReactNode, useId, useRef, useState } from 'react';
import { InfoLabel } from 'src/components/InfoLabel';
import { figVars, onAccent } from 'src/utils/figmaColors';
import { motion } from 'src/utils/motion';

const THUMB_INSET = 6;
const TRACK_HEIGHT = 6;
const THUMB_RING = `inset 0 0 0 1px ${figVars['border-2']}`;

const VALUE_BOX_SX = {
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  ml: 'auto',
  height: '2rem',
  p: '0.4375rem 0.625rem 0.4375rem 0.75rem',
  borderRadius: '0.5rem',
  boxShadow: `inset 0 0 0 1px ${figVars['border-1']}`,
  typography: 'h5',
  fontSize: { xs: 16, sm: 14 },
  fontVariantNumeric: 'tabular-nums',
  color: 'fg-1',
  cursor: 'text',
  transition: `background-color ${motion.duration.hover}ms ${motion.easing.standard}`,
  '&:focus-within': { backgroundColor: figVars['bg-3'] },
} as const;

const VALUE_INPUT_SX = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  m: 0,
  p: 0,
  border: 'none',
  background: 'none',
  color: 'inherit',
  font: 'inherit',
  '&:focus': { outline: 'none' },
  '&::placeholder': { color: 'fg-4', opacity: 1 },
} as const;

const SLIDER_SX = {
  display: 'block',
  width: 'auto',
  height: '1.125rem',
  mt: '1rem',
  mx: `${THUMB_INSET}px`,
  p: 0,
  '@media (pointer: coarse)': { p: 0 },
  '& .MuiSlider-rail': {
    left: -THUMB_INSET,
    right: -THUMB_INSET,
    width: 'auto',
    height: TRACK_HEIGHT,
    borderRadius: '99px',
    backgroundColor: 'bg-4',
    opacity: 1,
  },
  '& .MuiSlider-track': {
    height: TRACK_HEIGHT,
    border: 'none',
    borderRadius: '99px',
    backgroundColor: 'fg-1',
    boxSizing: 'content-box',
    ml: `${-THUMB_INSET}px`,
    pl: `${THUMB_INSET}px`,
  },
  '& .MuiSlider-thumb': {
    width: 20,
    height: 20,
    backgroundColor: onAccent,
    boxShadow: THUMB_RING,
    '&::before': { boxShadow: 'none' },
    '&:hover, &.Mui-focusVisible, &.Mui-active': { boxShadow: THUMB_RING },
    '&.Mui-focusVisible': { outline: `2px solid ${figVars['fg-1']}`, outlineOffset: '2px' },
  },
} as const;

const ROOT_SX = { display: 'flex', flexDirection: 'column', p: '1rem 1.25rem 1.5rem' } as const;
const ROOT_DISABLED_SX = { ...ROOT_SX, opacity: 0.4 } as const;
const HEADER_SX = { display: 'flex', alignItems: 'center', gap: '1rem' } as const;
const MIRROR_WRAP_SX = { position: 'relative' } as const;
const MIRROR_SX = { visibility: 'hidden', whiteSpace: 'pre', pr: '1px' } as const;

const STOPS_SX = {
  position: 'relative',
  height: '0.875rem',
  mt: '0.4375rem',
  typography: 'base',
  lineHeight: 1,
  color: 'fg-4',
  userSelect: 'none',
} as const;
const STOP_SX = { position: 'absolute', top: 0, whiteSpace: 'nowrap' } as const;

const decimalsOf = (step: number) => (String(step).split('.')[1] ?? '').length;

const StopLabels = memo(function StopLabels({
  stops,
  min,
  max,
  unit,
  decimals,
}: {
  stops: number[];
  min: number;
  max: number;
  unit: string;
  decimals: number;
}) {
  return (
    <Box aria-hidden sx={STOPS_SX}>
      {stops.map((stop) => (
        <Box
          key={stop}
          component="span"
          sx={STOP_SX}
          style={
            stop <= min
              ? { left: 0 }
              : stop >= max
              ? { right: 0 }
              : {
                  left: `calc(${THUMB_INSET}px + (100% - ${2 * THUMB_INSET}px) * ${
                    (stop - min) / (max - min)
                  })`,
                  transform: 'translateX(-50%)',
                }
          }
        >
          {stop.toFixed(decimals)}
          {unit}
        </Box>
      ))}
    </Box>
  );
});

const ValueInput = ({
  value,
  min,
  max,
  step,
  decimals,
  unit,
  disabled,
  labelId,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  decimals: number;
  unit: string;
  disabled?: boolean;
  labelId?: string;
  onCommit: (value: number) => void;
}) => {
  const [draft, setDraft] = useState<string | null>(null);
  const discarding = useRef(false);
  const shown = draft ?? value.toFixed(decimals);

  const commitDraft = () => {
    if (discarding.current) {
      discarding.current = false;
      return;
    }
    if (draft === null) return;
    setDraft(null);
    const typed = Number(draft.trim().replace(',', '.'));
    if (draft.trim() === '' || !Number.isFinite(typed)) return;
    const stepped = Number((Math.round(typed / step) * step).toFixed(decimals));
    onCommit(Math.min(Math.max(stepped, min), max));
  };

  return (
    <Box component="label" sx={VALUE_BOX_SX}>
      <Box sx={MIRROR_WRAP_SX}>
        <Box component="span" aria-hidden sx={MIRROR_SX}>
          {shown || '0'}
        </Box>
        <Box
          component="input"
          aria-labelledby={labelId}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          disabled={disabled}
          value={shown}
          onChange={(event) => {
            const pattern = decimals ? new RegExp(`^\\d*(?:[.,]\\d{0,${decimals}})?$`) : /^\d*$/;
            if (pattern.test(event.target.value)) setDraft(event.target.value);
          }}
          onFocus={(event) => event.target.select()}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
            if (event.key === 'Escape') {
              discarding.current = true;
              setDraft(null);
              event.currentTarget.blur();
            }
          }}
          sx={VALUE_INPUT_SX}
        />
      </Box>
      {unit}
    </Box>
  );
};

interface InputRangeProps {
  label?: ReactNode;
  tooltip?: ReactNode;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  stops?: number[];
  unit?: string;
  disabled?: boolean;
  onValueChange: (value: number) => void;
  onValueCommit?: (value: number) => void;
}

export const InputRange = ({
  label,
  tooltip,
  value,
  min = 0,
  max = 100,
  step = 1,
  stops,
  unit = '',
  disabled,
  onValueChange,
  onValueCommit,
}: InputRangeProps) => {
  const labelId = useId();
  const labelledBy = label ? labelId : undefined;
  const decimals = decimalsOf(step);

  return (
    <Box sx={disabled ? ROOT_DISABLED_SX : ROOT_SX}>
      <Box sx={HEADER_SX}>
        {label && <InfoLabel id={labelId} label={label} tooltip={tooltip} iconMargin={1.5} />}
        <ValueInput
          value={value}
          min={min}
          max={max}
          step={step}
          decimals={decimals}
          unit={unit}
          disabled={disabled}
          labelId={labelledBy}
          onCommit={(next) => {
            if (next !== value) onValueChange(next);
            onValueCommit?.(next);
          }}
        />
      </Box>

      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(_, next) => onValueChange(next as number)}
        onChangeCommitted={(_, next) => onValueCommit?.(next as number)}
        aria-labelledby={labelledBy}
        getAriaValueText={(next) => `${next.toFixed(decimals)}${unit}`}
        sx={SLIDER_SX}
      />

      {stops && <StopLabels stops={stops} min={min} max={max} unit={unit} decimals={decimals} />}
    </Box>
  );
};
