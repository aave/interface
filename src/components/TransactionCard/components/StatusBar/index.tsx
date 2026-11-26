import { Box, GlobalStyles, keyframes } from '@mui/material';
import { useState } from 'react';
import type { TxStatus } from 'src/components/transactions/FlowCommons/TxStatusHeader';
import { figVars } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

import { ParticleCanvas } from '../ParticleCanvas';

const flash = keyframes`
  0% { opacity: 1; transform: scale(0.95); }
  15% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.15); }
`;

const shadowBreathe = keyframes`
  0%, 100% { transform: scaleY(0.9); opacity: 0.8; }
  50% { transform: scaleY(1.2); opacity: 1; }
`;

const haloPulse = keyframes`
  0%, 100% { opacity: calc(0.45 * var(--tx-glow)); }
  50% { opacity: calc(0.9 * var(--tx-glow)); }
`;

const tipPulse = keyframes`
  0%, 100% { transform: translate(var(--tip-tx), var(--tip-ty)) scale(var(--tip-min)); }
  50% { transform: translate(var(--tip-tx), var(--tip-ty)) scale(var(--tip-max)); }
`;

const wispSpin = keyframes`
  0% { transform: rotate(var(--wisp-rot-from)); }
  100% { transform: rotate(var(--wisp-rot-to)); }
`;

const PROPERTIES = (
  <GlobalStyles
    styles={{
      '@property --tx-status-color': {
        syntax: "'<color>'",
        inherits: 'true',
        initialValue: '#9391f7',
      },
      '@property --tx-status-color-2': {
        syntax: "'<color>'",
        inherits: 'true',
        initialValue: '#e2e0ff',
      },
      '@property --tx-status-body': {
        syntax: "'<color>'",
        inherits: 'true',
        initialValue: '#9391f7',
      },
      '@property --tx-status-progress': {
        syntax: "'<length-percentage>'",
        inherits: 'true',
        initialValue: '100%',
      },
    }}
  />
);

const tipPulseAnimation = (delay: string) =>
  `${tipPulse} var(--pulse-duration) ease infinite${delay ? ` ${delay}` : ''}`;

const TIP_SX = {
  position: 'absolute',
  left: '100%',
  pointerEvents: 'none',
  willChange: 'transform, opacity',
  transition: 'opacity var(--duration) ease-out',
} as const;

const HOT_WHITE =
  'color-mix(in srgb, rgb(255 255 255 / 0.95), var(--tx-status-color-2) var(--tx-hot))';

const PART = {
  effects: '& [data-tx="effects"], & [data-tx="fill-effects"]',
  halo: '& [data-tx="halo"]',
  fill: '& [data-tx="fill"]',
  smoke: '& [data-tx="smoke"]',
  animated:
    '& [data-tx="halo"], & [data-tx="wisp"], & [data-tx="fill-glow"], & [data-tx="tip-bulb"], & [data-tx="tip-core"], & [data-tx="tip-hot"], & [data-tx="fill"]::before, & [data-tx="fill"]::after',
  blooms: '& [data-tx="fill"]::before, & [data-tx="fill"]::after',
};

const wisp = (
  left: string,
  rotate: [string, string],
  animation: string,
  size?: { width: string; height: string; blur: string; opacity: number }
) => ({
  left,
  '--wisp-rot-from': rotate[0],
  '--wisp-rot-to': rotate[1],
  animation: `${wispSpin} ${animation}`,
  ...(size && {
    width: size.width,
    height: size.height,
    filter: `blur(${size.blur})`,
    opacity: size.opacity,
  }),
});

const STATUS_BAR_SX = {
  '--duration': '2000ms',
  '--pulse-duration': '1.25s',
  '--tx-status-progress': '100%',
  '--tx-status-body': 'var(--tx-status-color)',
  '--theme-is-light': 1,
  '--tx-graphic-purple-1': figVars['purple-1'],
  '--tx-graphic-purple-2': figVars['purple-2'],
  '--tx-glow': 'calc(1 - 0.2 * var(--theme-is-light, 0))',
  '--tx-hot': 'calc(100% * var(--theme-is-light, 0))',
  '--tx-bloom-size': 'calc(1 + 0.15 * var(--theme-is-light, 0))',
  ...darkScheme({
    '--theme-is-light': 0,
    '--tx-graphic-purple-1': figVars['purple-3'],
    '--tx-graphic-purple-2': figVars['purple-1'],
  }),
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '0.25rem',

  '&[data-status="pending"]': {
    '--tx-status-color': figVars['purple-1'],
    '--tx-status-color-2': 'var(--tx-graphic-purple-1)',
    '--tx-status-body': `color-mix(in srgb, var(--tx-graphic-purple-2), ${figVars['purple-3']} calc(50% * var(--theme-is-light, 0)))`,
    '--tx-status-progress': '56.82%',
    '@media (prefers-reduced-motion: no-preference)': {
      [`${PART.halo}, ${PART.fill}`]: { '@starting-style': { width: '2.5%' } },
      [PART.smoke]: { '@starting-style': { maskSize: '0 100%' } },
    },
  },
  '&[data-status="success"]': {
    '--tx-status-color': figVars['data-green'],
    '--tx-status-color-2': figVars['data-green'],
    '--duration': '200ms',
  },
  '&[data-status="error"]': {
    '--tx-status-color': figVars['data-red'],
    '--tx-status-color-2': figVars['data-red'],
    '--duration': '200ms',
  },
  '&[data-status="cancelled"], &[data-status="expired"]': {
    '--tx-status-color': figVars['fg-3'],
    '--tx-status-color-2': figVars['fg-3'],
    '--duration': '200ms',
  },

  [PART.effects]: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    transition: 'opacity 2200ms ease-out 300ms',
  },

  [PART.halo]: {
    position: 'absolute',
    top: '-0.4375rem',
    bottom: '-0.21875rem',
    left: 0,
    width: 'var(--tx-status-progress)',
    background: 'linear-gradient(90deg, var(--tx-status-body) 60%, var(--tx-status-color-2) 100%)',
    filter: 'blur(0.5rem)',
    opacity: 'calc(0.5 * var(--tx-glow))',
    borderRadius: '0.625rem',
    pointerEvents: 'none',
    animation: `${haloPulse} var(--pulse-duration) ease infinite`,
    transition:
      'width var(--duration) ease, bottom var(--duration) ease, --tx-status-body var(--duration) ease, --tx-status-color-2 var(--duration) ease',
  },

  [PART.fill]: {
    position: 'absolute',
    inset: 0,
    width: 'var(--tx-status-progress)',
    borderRadius: '1rem',
    background: `radial-gradient(ellipse 55% 130% at 95% 50%, color-mix(in srgb, rgb(255 255 255 / 0.35), transparent var(--tx-hot)) 0%, rgb(255 255 255 / 0) 70%), linear-gradient(90deg, var(--tx-status-body) 60%, var(--tx-status-color-2) 100%)`,
    transition:
      'width var(--duration) ease, --tx-status-color var(--duration) ease, --tx-status-color-2 var(--duration) ease, --tx-status-body var(--duration) ease',
    '&::after': {
      ...TIP_SX,
      content: '""',
      top: '50%',
      width: '3.5rem',
      height: '3.5rem',
      borderRadius: '50%',
      background: 'radial-gradient(circle, var(--tx-status-color) 0%, transparent 70%)',
      filter: 'blur(1.125rem)',
      '--tip-tx': '-50%',
      '--tip-ty': 'calc(-50% - 0.75rem)',
      '--tip-min': 'var(--tx-bloom-size)',
      '--tip-max': 'calc(1.15 * var(--tx-bloom-size))',
      transform: 'translate(var(--tip-tx), var(--tip-ty)) scale(var(--tx-bloom-size))',
      opacity: 0.95,
      animation: tipPulseAnimation(''),
    },
    '&::before': {
      ...TIP_SX,
      content: '""',
      top: '50%',
      width: '2rem',
      height: '2rem',
      borderRadius: '50%',
      background: 'radial-gradient(circle, var(--tx-status-color) 0%, transparent 65%)',
      filter: 'blur(0.625rem)',
      '--tip-tx': '-30%',
      '--tip-ty': 'calc(-50% - 0.375rem)',
      '--tip-min': 'calc(0.9 * var(--tx-bloom-size))',
      '--tip-max': 'calc(1.1 * var(--tx-bloom-size))',
      transform: 'translate(var(--tip-tx), var(--tip-ty)) scale(var(--tx-bloom-size))',
      opacity: 0.85,
      animation: tipPulseAnimation('1.3s'),
    },
  },

  '& [data-tx="fill-glow"]': {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    boxShadow:
      '0 0 1.875rem 0.28125rem color-mix(in srgb, var(--tx-status-body) calc(20% * var(--tx-glow)), transparent), 0 0 4rem 0.46875rem color-mix(in srgb, var(--tx-status-body) calc(9% * var(--tx-glow)), transparent)',
    willChange: 'transform, opacity',
    animation: `${shadowBreathe} 10s linear infinite`,
  },

  '& [data-tx="tip-bulb"]': {
    ...TIP_SX,
    top: 'calc(50% - 0.0625rem)',
    width: '1.75rem',
    height: '0.375rem',
    filter: 'blur(0.125rem)',
    '--tip-tx': 'calc(-100% + 0.25rem)',
    '--tip-ty': '-50%',
    '--tip-min': 0.95,
    '--tip-max': 1.1,
    transform: 'translate(var(--tip-tx), var(--tip-ty))',
    opacity: 1,
    animation: tipPulseAnimation('0.3s'),
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: '62.4375rem',
      background: `linear-gradient(90deg, transparent 0%, var(--tx-status-color-2) 45%, ${HOT_WHITE} 100%)`,
      maskImage: 'radial-gradient(ellipse 100% 50% at 100% 50%, black 90%, transparent 100%)',
    },
  },

  '& [data-tx="tip-core"]': {
    ...TIP_SX,
    top: '50%',
    width: '1.125rem',
    height: '1.125rem',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, var(--tx-status-color-2) 0%, var(--tx-status-color) 50%, transparent 80%)',
    filter: 'blur(0.25rem)',
    '--tip-tx': '-40%',
    '--tip-ty': 'calc(-50% - 0.25rem)',
    '--tip-min': 0.95,
    '--tip-max': 1.15,
    transform: 'translate(var(--tip-tx), var(--tip-ty))',
    opacity: 1,
    animation: tipPulseAnimation('0.6s'),
  },

  '& [data-tx="tip-hot"]': {
    ...TIP_SX,
    top: '50%',
    width: '0.5rem',
    height: '0.5rem',
    borderRadius: '50%',
    background: `radial-gradient(circle, ${HOT_WHITE} 0%, var(--tx-status-color-2) 50%, transparent 100%)`,
    filter: 'blur(0.09375rem)',
    '--tip-tx': 'calc(-50% - 0.0625rem)',
    '--tip-ty': 'calc(-50% - 0.125rem)',
    '--tip-min': 0.9,
    '--tip-max': 1.1,
    transform: 'translate(var(--tip-tx), var(--tip-ty))',
    opacity: 1,
    animation: tipPulseAnimation('1s'),
  },

  [PART.smoke]: {
    position: 'absolute',
    top: '-7.5rem',
    bottom: '-7.5rem',
    left: 0,
    right: 0,
    pointerEvents: 'none',
    maskImage: 'linear-gradient(to right, black 0, black calc(100% - 2.5rem), transparent 100%)',
    maskSize: 'var(--tx-status-progress) 100%',
    maskRepeat: 'no-repeat',
    transition: 'mask-size var(--duration) ease, opacity 600ms ease-out',
  },

  '& [data-tx="wisp"]': {
    position: 'absolute',
    top: 'calc(50% - 0.75rem)',
    width: '3rem',
    height: '0.5rem',
    background:
      'radial-gradient(ellipse at left center, var(--tx-status-color) 0%, transparent 70%)',
    filter: 'blur(0.4375rem)',
    transformOrigin: '0 50%',
    pointerEvents: 'none',
    opacity: 0.9,
  },
  '& [data-tx="wisp"]:nth-of-type(1)': wisp(
    '20%',
    ['-25deg', '45deg'],
    '4s ease infinite alternate'
  ),
  '& [data-tx="wisp"]:nth-of-type(2)': wisp(
    '38%',
    ['-10deg', '50deg'],
    '5.3s ease -2.1s infinite alternate-reverse',
    { width: '2.25rem', height: '0.375rem', blur: '0.3125rem', opacity: 0.8 }
  ),
  '& [data-tx="wisp"]:nth-of-type(3)': wisp(
    '55%',
    ['10deg', '60deg'],
    '3.4s ease -1.3s infinite alternate',
    { width: '2.5rem', height: '0.4375rem', blur: '0.375rem', opacity: 0.8 }
  ),
  '& [data-tx="wisp"]:nth-of-type(4)': wisp(
    '82%',
    ['-30deg', '35deg'],
    '6.8s ease -3.5s infinite alternate-reverse',
    { width: '3.375rem', height: '0.625rem', blur: '0.5625rem', opacity: 0.85 }
  ),

  '&[data-status="success"], &[data-status="error"], &[data-status="cancelled"], &[data-status="expired"]':
    {
      [PART.effects]: { opacity: 0.25, '@media (max-width: 550px)': { opacity: 0.4 } },
      [PART.animated]: { animationPlayState: 'paused' },
      [PART.blooms]: { opacity: 0.2, transition: 'opacity 2000ms ease-out' },
    },

  '& [data-tx="flash"]': {
    borderRadius: '1rem',
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    boxShadow: '0 0 1.5rem 0.5rem color-mix(in srgb, var(--tx-status-color) 90%, transparent)',
    willChange: 'transform, opacity',
    animation: `${flash} 0.6s ease-out forwards`,
  },

  '@media (prefers-reduced-motion: reduce)': {
    [`${PART.effects}, ${PART.fill}, ${PART.blooms}, ${PART.halo}, & [data-tx="fill-glow"], & [data-tx="tip-bulb"], & [data-tx="tip-core"], & [data-tx="tip-hot"]`]:
      { animation: 'none', transition: 'none' },
    [PART.smoke]: { display: 'none' },
  },
} as const;

const WISPS = [0, 1, 2, 3];

export const StatusBar = ({ status }: { status: TxStatus }) => {
  const [flashing, setFlashing] = useState(false);
  const [prevStatus, setPrevStatus] = useState(status);
  if (status !== prevStatus) {
    setPrevStatus(status);
    if (prevStatus === 'pending' && (status === 'success' || status === 'error')) {
      setFlashing(true);
    }
  }

  return (
    <Box data-status={status} sx={STATUS_BAR_SX}>
      {PROPERTIES}
      <div data-tx="effects">
        <div data-tx="halo" />
        <div data-tx="smoke">
          {WISPS.map((i) => (
            <div key={i} data-tx="wisp" />
          ))}
          <ParticleCanvas status={status} />
        </div>
      </div>
      <div data-tx="fill">
        <div data-tx="fill-effects">
          <div data-tx="fill-glow" />
          <div data-tx="tip-bulb" />
          <div data-tx="tip-core" />
          <div data-tx="tip-hot" />
        </div>
        {flashing ? <div data-tx="flash" onAnimationEnd={() => setFlashing(false)} /> : null}
      </div>
    </Box>
  );
};
