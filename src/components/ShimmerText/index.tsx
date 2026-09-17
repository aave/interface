import { Box, Typography, TypographyProps } from '@mui/material';
import { AnimationEvent, useEffect, useMemo, useState } from 'react';
import { figVars } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

const SWEEP_MS = 2400;
const SWEEP_NAME = 'shimmer-text-sweep';
const WEIGHT_NAME = 'shimmer-text-weight';
const SWEEP_ANIMATION = `${SWEEP_NAME} ${SWEEP_MS}ms linear infinite`;

/** Fraction of the loop by which a letter's weight leads the band. Raise it if it reads as late. */
const WEIGHT_LEAD = 0.1;

/**
 * Room for the bloom, which `mask-clip: border-box` would otherwise cut off square. The ghosts pad
 * themselves back out; `mask-origin: content-box` keeps the band's travel measured against the word.
 */
const BLOOM_ROOM = '1.5rem';

const BAND = [
  'transparent 32%',
  'rgba(0, 0, 0, 0.18) 40%',
  'rgba(0, 0, 0, 1) 50%',
  'rgba(0, 0, 0, 0.18) 60%',
  'transparent 68%',
].join(', ');

const rootSx = {
  position: 'relative',
  display: 'inline-block',
  isolation: 'isolate',
  '--shimmer-weight-rest': 500,
  '--shimmer-weight-lit': 550,
  ...darkScheme({ '--shimmer-weight-lit': 600 }),
  fontWeight: 'var(--shimmer-weight-rest)',
  [`@keyframes ${SWEEP_NAME}`]: {
    from: { WebkitMaskPosition: '100% 50%', maskPosition: '100% 50%' },
    to: { WebkitMaskPosition: '0% 50%', maskPosition: '0% 50%' },
  },
  [`@keyframes ${WEIGHT_NAME}`]: {
    '0%': { fontWeight: 'var(--shimmer-weight-rest)' },
    '36%': { fontWeight: 'var(--shimmer-weight-rest)' },
    '50%': { fontWeight: 'var(--shimmer-weight-lit)' },
    '64%': { fontWeight: 'var(--shimmer-weight-rest)' },
    '100%': { fontWeight: 'var(--shimmer-weight-rest)' },
  },
} as const;

const ghostSx = {
  WebkitMaskImage: `linear-gradient(100deg, ${BAND})`,
  maskImage: `linear-gradient(100deg, ${BAND})`,
  WebkitMaskOrigin: 'content-box',
  maskOrigin: 'content-box',
  WebkitMaskSize: '300% 300%',
  maskSize: '300% 300%',
  WebkitMaskRepeat: 'no-repeat',
  maskRepeat: 'no-repeat',
  WebkitMaskPosition: '100% 50%',
  maskPosition: '100% 50%',
  position: 'absolute',
  inset: `-${BLOOM_ROOM}`,
  padding: BLOOM_ROOM,
  boxSizing: 'border-box',
  pointerEvents: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  WebkitTextFillColor: 'transparent',
} as const;

const bloomSx = {
  ...ghostSx,
  zIndex: 0,
  opacity: 0.45,
  textShadow: `0 0 0.35rem ${figVars['purple-1']}, 0 0 1rem ${figVars['purple-1']}`,
  ...darkScheme({
    opacity: 0.7,
    textShadow: `0 0 0.45rem ${figVars['purple-2']}, 0 0 1.25rem ${figVars['purple-1']}`,
  }),
} as const;

const glintSx = {
  ...ghostSx,
  zIndex: 2,
  opacity: 0.85,
  WebkitTextFillColor: figVars['purple-1'],
  ...darkScheme({ opacity: 0.55, WebkitTextFillColor: figVars['purple-3'] }),
} as const;

const inkTextSx = { position: 'relative', zIndex: 1 } as const;
const letterSx = { position: 'relative', display: 'inline-block', whiteSpace: 'pre' } as const;
const gaugeSx = { visibility: 'hidden' } as const;
const inkSx = { position: 'absolute', inset: 0 } as const;
const inkRunningSx = {
  ...inkSx,
  animation: `${WEIGHT_NAME} ${SWEEP_MS}ms ease-in-out calc(var(--letter-phase) * ${SWEEP_MS}ms) infinite`,
} as const;

const splitLetters = (text: string, running: boolean) =>
  [...text].map((letter, index, all) => (
    <Box
      key={`${index}-${letter}`}
      component="span"
      sx={letterSx}
      style={{ '--letter-phase': (index + 0.5) / all.length / 2 - 0.25 - WEIGHT_LEAD } as object}
    >
      <Box component="span" sx={gaugeSx}>
        {letter}
      </Box>
      <Box component="span" sx={running ? inkRunningSx : inkSx}>
        {letter}
      </Box>
    </Box>
  ));

export interface ShimmerTextProps extends Omit<TypographyProps, 'children'> {
  text: string;
  /** Turning this off lets the sweep in flight finish rather than freezing it mid-word. */
  active?: boolean;
}

export const ShimmerText = ({ text, active = false, sx, ...props }: ShimmerTextProps) => {
  const [finishing, setFinishing] = useState(false);
  const running = active || finishing;

  useEffect(() => {
    if (active) setFinishing(true);
  }, [active]);

  const stopAtBoundary = (event: AnimationEvent<HTMLElement>) => {
    if (!active && event.animationName === SWEEP_NAME) setFinishing(false);
  };

  const letters = useMemo(() => splitLetters(text, running), [text, running]);
  const [bloom, glint] = useMemo(() => {
    const animation = running ? SWEEP_ANIMATION : 'none';
    return [
      { ...bloomSx, animation },
      { ...glintSx, animation },
    ];
  }, [running]);

  return (
    <Typography
      aria-label={text}
      onAnimationIteration={stopAtBoundary}
      // `prefers-reduced-motion` pins every animation to one iteration, so the sweep ends instead.
      onAnimationEnd={stopAtBoundary}
      {...props}
      sx={[rootSx, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box component="span" sx={inkTextSx}>
        {letters}
      </Box>
      <Box component="span" aria-hidden sx={bloom}>
        {letters}
      </Box>
      <Box component="span" aria-hidden sx={glint}>
        {letters}
      </Box>
    </Typography>
  );
};
