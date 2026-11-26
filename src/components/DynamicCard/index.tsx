import { Box } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { Children, createContext, forwardRef, isValidElement, ReactNode } from 'react';
import { AutoResizer } from 'src/components/AutoResizer';
import { CARD_SURFACE_SX } from 'src/utils/figmaColors';

const INNER_SX = {
  ...CARD_SURFACE_SX,
  position: 'relative',
  zIndex: 1,
  overflow: 'hidden',
  width: '100%',
} as const;

export const DynamicCardLastItemContext = createContext<boolean | undefined>(undefined);

const DynamicCardItem = forwardRef<HTMLDivElement, { last: boolean; children: ReactNode }>(
  function DynamicCardItem({ last, children }, ref) {
    return (
      <div ref={ref}>
        <DynamicCardLastItemContext.Provider value={last}>
          {children}
        </DynamicCardLastItemContext.Provider>
      </div>
    );
  }
);

export const DynamicCard = ({ children }: { children: ReactNode }) => (
  <motion.div
    layout="position"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}
  >
    {children}
  </motion.div>
);

const DynamicCardInner = ({ children }: { children: ReactNode }) => {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <Box sx={INNER_SX}>
      <AutoResizer duration={400} overflow>
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((item, index) => (
            <DynamicCardItem key={item.key} last={index === items.length - 1}>
              {item}
            </DynamicCardItem>
          ))}
        </AnimatePresence>
      </AutoResizer>
    </Box>
  );
};
DynamicCard.Inner = DynamicCardInner;

const DynamicCardDivider = () => <Box sx={{ mx: '1.25rem', height: '1px', bgcolor: 'border-0' }} />;
DynamicCard.Divider = DynamicCardDivider;
