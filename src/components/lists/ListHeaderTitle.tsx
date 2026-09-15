import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useRootStore } from 'src/store/root';
import { figVars } from 'src/utils/figmaColors';
import { motion } from 'src/utils/motion';

import { MARKETS } from '../../utils/events';

// Every value here is a module-scope constant, so the object is built once rather than per
// sortable column per render. The transition sits on `path`, not on the active class, so the
// chevron losing the highlight fades out too — the class is removed, not restyled.
const SORT_INDICATOR_SX = {
  display: 'inline-flex',
  flexShrink: 0,
  ml: 1,
  color: 'fg-icon',
  '& path': { transition: `stroke ${motion.duration.hover}ms ${motion.easing.standard}` },
  '& .sort-arrow-active': { stroke: figVars['fg-1'] },
};

interface ListHeaderTitleProps {
  sortName?: string;
  sortDesc?: boolean;
  sortKey?: string;
  source?: string;
  setSortName?: (value: string) => void;
  setSortDesc?: (value: boolean) => void;
  onClick?: () => void;
  /**
   * Size to the label instead of the column, spilling right rather than truncating. Only valid
   * on the last mapped column, whose right-hand neighbour is the empty actions header — there is
   * no reserved space, so a neighbour with content would be overlapped.
   */
  noTruncate?: boolean;
  children: ReactNode;
}

export const ListHeaderTitle = ({
  sortName,
  sortDesc,
  sortKey,
  source,
  setSortName,
  setSortDesc,
  onClick,
  noTruncate = false,
  children,
}: ListHeaderTitleProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  // Three-state cycle: descending, then ascending, then cleared. An empty `sortName` is what
  // unsorts, and the direction goes back to the `false` every list mounts with — the borrowed
  // positions pre-sort still reads it once the name is gone, so `true` would clear that list into
  // the reverse of its own order rather than into it.
  const handleSorting = (name: string) => {
    trackEvent(MARKETS.SORT, { sort_by: name, tile: source });
    const [nextName, nextDesc]: [string, boolean] =
      sortName !== name ? [name, true] : sortDesc ? [name, false] : ['', false];
    setSortName?.(nextName);
    setSortDesc?.(nextDesc);
  };

  const isSorted = !!sortKey && sortName === sortKey;

  return (
    <Typography
      component="div"
      color="fg-3"
      onClick={() => (!!onClick ? onClick() : !!sortKey && handleSorting(sortKey))}
      sx={{
        cursor: !!onClick || !!sortKey ? 'pointer' : 'default',
        display: 'inline-flex',
        alignItems: 'center',
        maxWidth: noTruncate ? 'fit-content' : '100%',
        minWidth: 0,
        fontFamily: 'Inter',
        fontSize: '0.6875rem',
        fontWeight: 500,
        lineHeight: '120%',
        letterSpacing: '0.00313rem',
        textTransform: 'uppercase',
        fontFeatureSettings: "'cv11' on",
        // Header titles are often a tooltip component that renders its own Typography with a
        // `variant`; force those to take the header type instead of their own.
        '& .MuiTypography-root': { font: 'inherit', letterSpacing: 'inherit' },
      }}
    >
      {/* Truncation has to live on an inner block — `text-overflow` is ignored on the flex
          container itself, so the label would otherwise overrun into the next column. */}
      <Box
        component="span"
        sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {children}
      </Box>

      {!!sortKey && (
        <Box sx={SORT_INDICATOR_SX}>
          {/* Sortable indicator: an up/down chevron, the one matching the active direction lit.
              The resting color comes from the fg-icon token via currentColor on the Box — the
              P3-safe way to tint an SVG, since var() doesn't resolve in SVG presentation
              attributes. stroke/width/caps are inherited by both paths. */}
          <svg
            width="8"
            height="10"
            viewBox="0 0 8 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className={isSorted && !sortDesc ? 'sort-arrow-active' : undefined}
              d="M1.59961 3L3.99961 1L6.39961 3"
            />
            <path
              className={isSorted && sortDesc ? 'sort-arrow-active' : undefined}
              d="M1.59961 7L3.99961 9L6.39961 7"
            />
          </svg>
        </Box>
      )}
    </Typography>
  );
};
