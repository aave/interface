import { Box, Slider } from '@mui/material';
import { useLeverageContext } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';

const marks = [
  {
    value: 2,
    label: '2x',
  },
  {
    value: 3,
    label: '3x',
  },
  {
    value: 4,
    label: '4x',
  },
  {
    value: 5,
    label: '5x',
  },
  {
    value: 6,
    label: '6x',
  },
  {
    value: 7,
    label: '7x',
  },
  {
    value: 8,
    label: '8x',
  },
  {
    value: 9,
    label: '9x',
  },
  {
    value: 10,
    label: '10x',
  },
  {
    value: 11,
    label: '11x',
  },
  {
    value: 12,
    label: '12x',
  },
];

export default function LeverageSlider() {
  const { setLeverage } = useLeverageContext();
  return (
    <Box sx={{ width: '95%', m: 'auto' }}>
      <Slider
        min={2}
        max={12}
        marks={marks}
        step={1}
        defaultValue={2}
        aria-label="Leverage"
        getAriaValueText={(value: number) => `${value}`}
        sx={{
          fontWeight: '800',
          fontSize: '14px',
        }}
        onChange={(e, val) => {
          void e;
          setLeverage(val as number);
        }}
      />
    </Box>
  );
}
