import { Box } from '@mui/material';

const PULSE = 'chart-end-dot-pulse';

export const ChartEndDot = ({
  color,
  pulse = false,
  radius = 4,
}: {
  color: string;
  pulse?: boolean;
  radius?: number;
}) => (
  <>
    {pulse && (
      <Box
        component="circle"
        r={radius}
        sx={{
          fill: color,
          transformBox: 'fill-box',
          transformOrigin: 'center',
          pointerEvents: 'none',
          [`@keyframes ${PULSE}`]: {
            '0%': { transform: 'scale(1)', opacity: 0.45 },
            '70%, 100%': { transform: 'scale(3.2)', opacity: 0 },
          },
          animation: `${PULSE} 2s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
        }}
      />
    )}
    <Box component="circle" r={radius} sx={{ fill: color }} />
  </>
);
