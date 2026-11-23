import { Box, keyframes, Skeleton } from '@mui/material';
import { AnimatePresence, motion } from 'motion/react';
import { ReactNode, useContext } from 'react';
import { DynamicCardLastItemContext } from 'src/components/DynamicCard';
import { ArrowRightIcon } from 'src/components/icons/ArrowRightIcon';
import { InfoLabel } from 'src/components/InfoLabel';
import { NoData } from 'src/components/primitives/NoData';
import { figVars } from 'src/utils/figmaColors';

const updating = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.4; }
`;

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const SKELETON = (
  <Skeleton variant="rectangular" width={40} height={12} sx={{ borderRadius: '0.5rem' }} />
);

interface DescriptionItemProps {
  label?: ReactNode;
  labelTooltip?: ReactNode;
  value: ReactNode;
  prevValue?: ReactNode;
  isLoading?: boolean;
  isUpdating?: boolean;
  valueTone?: 'primary' | 'secondary';
  forceShowDivider?: boolean;
}

export const DescriptionItem = ({
  label,
  labelTooltip,
  value,
  prevValue,
  isLoading,
  isUpdating,
  valueTone = 'primary',
  forceShowDivider = false,
}: DescriptionItemProps) => {
  const last = useContext(DynamicCardLastItemContext);
  const empty = value == null || value === '—' || value === '–';

  return (
    <motion.div {...FADE} transition={{ duration: 0.1 }} style={{ padding: '0 1.25rem' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.25rem',
          py: '1rem',
          ...((forceShowDivider || !last) && {
            borderBottom: '1px solid',
            borderColor: 'border-0',
          }),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          {label == null ? (
            SKELETON
          ) : (
            <InfoLabel label={label} tooltip={labelTooltip} iconMargin={2} />
          )}
        </Box>
        <AnimatePresence mode="popLayout" initial={false}>
          {isLoading ? (
            <motion.div key="skeleton" {...FADE}>
              {SKELETON}
            </motion.div>
          ) : (
            <motion.div
              key="rendered"
              {...FADE}
              style={{ display: 'flex', alignItems: 'center', height: 0 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  typography: 'h5',
                  color: empty ? 'fg-3' : valueTone === 'primary' ? 'fg-1' : 'fg-2',
                  whiteSpace: 'nowrap',
                  ...(isUpdating && { animation: `${updating} 1s ease-in-out infinite` }),
                  '& .MuiSwitch-root': { boxShadow: `0px 2px 4px 0px ${figVars['shadow-low']}` },
                  '& .MuiSwitch-track': { backgroundColor: 'fg-4' },
                  '& .MuiSwitch-thumb': { boxShadow: 'none' },
                }}
              >
                {prevValue && value !== prevValue ? (
                  <>
                    <Box sx={{ display: 'flex', color: 'fg-3' }}>{prevValue}</Box>
                    <ArrowRightIcon />
                    {value}
                  </>
                ) : (
                  value ?? <NoData />
                )}
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
};
