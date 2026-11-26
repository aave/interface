import { Box } from '@mui/material';
import { animate, motion, useMotionValue } from 'motion/react';
import { useEffect, useRef } from 'react';

type SpinnerState = 'pending' | 'success' | 'failure';

const EASE = 'easeInOut';

export const Spinner = ({
  size = 16,
  state = 'pending',
}: {
  size?: number;
  state?: SpinnerState;
}) => {
  const weight = 32 / size;
  const failure = state === 'failure';
  const success = state === 'success';
  const pending = state === 'pending';
  const spin = useMotionValue(0);
  const spunWhilePending = useRef(false);

  useEffect(() => {
    if (pending) {
      spunWhilePending.current = true;
      const loop = animate(spin, [0, 360], { duration: 1, repeat: Infinity, ease: 'linear' });
      return () => loop.stop();
    }
    const settle = animate(spin, spin.get() + (spunWhilePending.current ? 90 : 360), {
      duration: 0.25,
      ease: 'linear',
    });
    return () => settle.stop();
  }, [pending, spin]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        '& svg': { display: 'block', overflow: 'visible' },
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="8"
          cy="8"
          r="7"
          stroke="currentColor"
          strokeOpacity="0.25"
          strokeWidth={weight}
        />
        <g>
          <motion.path
            d="M5.96069 10.0786L10.0783 5.96094"
            stroke="currentColor"
            strokeWidth={weight}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={15}
            initial={{ strokeDashoffset: 15 }}
            animate={{ strokeDashoffset: failure ? 0 : 15 }}
            transition={{ duration: 0.25, ease: EASE, delay: failure ? 0.5 : 0 }}
          />
          <motion.path
            d="M3.13744 3.13672L10.0786 10.0779"
            stroke="currentColor"
            strokeWidth={weight}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={15}
            initial={{ strokeDashoffset: failure ? 28 : 30, strokeDasharray: 10 }}
            animate={{ strokeDashoffset: failure ? 16 : 30, strokeDasharray: 10 }}
            transition={{ duration: 0.25, ease: EASE, delay: failure ? 0.25 : 0 }}
          />
        </g>
        <motion.path
          d="M1.72559 4.97461L6.90836 10.1576L10.9407 6.236"
          stroke="currentColor"
          strokeWidth={weight}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={15}
          initial={{ strokeDashoffset: success ? 25 : 45 }}
          animate={{ strokeDashoffset: success ? 25 : 45 }}
          transition={{ duration: 0.25, ease: EASE, delay: success ? 0.25 : 0 }}
        />
        <g>
          <motion.g style={{ rotate: spin }}>
            <motion.g
              animate={{
                rotate: pending ? [0, 360] : 0,
                transition: {
                  duration: pending ? 1 : 0.25,
                  repeat: pending ? Infinity : 0,
                  ease: EASE,
                },
              }}
            >
              <motion.circle
                cx="8"
                cy="8"
                r="7"
                strokeDasharray={45}
                strokeLinecap="round"
                stroke="currentColor"
                strokeWidth={weight}
                initial={{ strokeDashoffset: 30 }}
                animate={
                  pending
                    ? {
                        rotate: 180,
                        strokeDashoffset: 30,
                        transition: { duration: 1, ease: EASE, delay: 0.25 },
                      }
                    : {
                        rotate: 180,
                        strokeDashoffset: 0,
                        transition: { duration: 0.25, ease: EASE },
                      }
                }
              />
            </motion.g>
          </motion.g>
        </g>
      </svg>
    </Box>
  );
};
