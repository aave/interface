import { Box } from '@mui/material';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { useId } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { motion as motionTokens } from 'src/utils/motion';

export type AssetGroupProps = {
  symbols: string[];
  max?: number;
  size?: number;
  direction?: 'ltr' | 'rtl';
  animated?: boolean;
  overlap?: number;
  cutoutGap?: number;
};

const OVERLAP = 4;
const CUTOUT_GAP = 2;
const TRANSITION = { duration: 0.2, ease: motionTokens.bezier.smooth } as const;

export const AssetGroup = ({
  symbols,
  max,
  size = 24,
  direction = 'ltr',
  animated = true,
  overlap = OVERLAP,
  cutoutGap = CUTOUT_GAP,
}: AssetGroupProps) => {
  const id = useId();
  const unique = symbols.filter(
    (symbol, index) =>
      symbols.findIndex((other) => other.toLowerCase() === symbol.toLowerCase()) === index
  );
  const rtl = direction === 'rtl';
  const sliced = max ? unique.slice(0, max) : unique;
  const ordered = rtl ? sliced.slice().reverse() : sliced;
  const hidden = max && unique.length > max ? unique.length - max : 0;

  const icon = (symbol: string) => <TokenIcon symbol={symbol} sx={{ fontSize: size }} />;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '0.375rem',
        '--margin': `-${overlap}px`,
        '--stroke': `${cutoutGap}px`,
        '--size': `${size}px`,
        '& [data-assets]': {
          '--neighbour-x': rtl ? 'calc(-50% - var(--margin))' : 'calc(150% + var(--margin))',
          display: 'flex',
          flexDirection: rtl ? 'row-reverse' : 'row',
          alignItems: 'center',
        },
        '& [data-asset]': {
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          borderRadius: '100%',
          bgcolor: 'bg-2',
          '&:not(:first-of-type)': rtl ? { mr: 'var(--margin)' } : { ml: 'var(--margin)' },
          // A hard stop isn't anti-aliased, so the cut's edge eases over half a pixel
          '&:not(:last-of-type)': {
            maskImage:
              'radial-gradient(circle at var(--neighbour-x) 50%, transparent calc(var(--size) / 2 + var(--stroke) - 0.25px), #000 calc(var(--size) / 2 + var(--stroke) + 0.25px))',
            maskRepeat: 'no-repeat',
          },
        },
        '& [data-more]': {
          color: 'fg-3',
          fontSize: '0.875rem',
          fontWeight: 500,
          lineHeight: 1,
        },
      }}
    >
      {animated ? (
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key="assets" layout layoutRoot data-assets>
            <LayoutGroup id={id}>
              {ordered.map((symbol) => (
                <motion.div
                  key={symbol}
                  layout="position"
                  layoutId={symbol}
                  data-asset
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.6 }}
                  transition={TRANSITION}
                >
                  {icon(symbol)}
                </motion.div>
              ))}
            </LayoutGroup>
          </motion.div>
          {hidden > 0 && (
            <motion.div
              key="more-assets"
              data-more
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={TRANSITION}
            >
              +{hidden}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <>
          <div data-assets>
            {ordered.map((symbol) => (
              <div key={symbol} data-asset>
                {icon(symbol)}
              </div>
            ))}
          </div>
          {hidden > 0 && <div data-more>+{hidden}</div>}
        </>
      )}
    </Box>
  );
};
