import { Box, CircularProgress, SxProps } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';

type QuoteProgressRingProps = {
  active: boolean;
  lastUpdatedAt: number | null;
  intervalMs: number;
  size?: number | string;
  thickness?: number;
  paused?: boolean;
  sx?: SxProps;
};

export const QuoteProgressRing = ({
  active,
  lastUpdatedAt,
  intervalMs,
  size = 44,
  thickness = 2,
  paused = false,
  sx,
}: QuoteProgressRingProps) => {
  const theme = useTheme();
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    if (!active || !lastUpdatedAt || intervalMs <= 0 || paused) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [active, lastUpdatedAt, intervalMs, paused]);

  const progress = useMemo(() => {
    if (!active || !lastUpdatedAt || intervalMs <= 0) return 0;
    const elapsed = Math.max(0, now - lastUpdatedAt);
    const ratio = Math.max(0, Math.min(1, elapsed / intervalMs));
    return ratio * 100;
  }, [active, lastUpdatedAt, intervalMs, now]);

  const ringColor = useMemo(() => {
    // Opacity from 0.25 to 1.0 based on progress
    const ratio = Math.max(0, Math.min(1, progress / 100));
    const opacity = 0.25 + 0.75 * ratio;
    return alpha(theme.palette.primary.main, opacity);
  }, [progress, theme]);

  if (!active || !lastUpdatedAt || intervalMs <= 0) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        top: '-1px',
        left: '-1px',
        right: '-1px',
        bottom: '-1px',
        transform: 'none',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <CircularProgress
        variant="determinate"
        value={progress}
        size={size}
        thickness={thickness}
        sx={{
          '& .MuiCircularProgress-circle': {
            stroke: ringColor,
          },
        }}
      />
    </Box>
  );
};
