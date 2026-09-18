import { Box, Breakpoint } from '@mui/material';
import { ReactNode } from 'react';
import { cardHeaderBandSx, cardHeaderTitleSx, cardHeadingSx } from 'src/utils/cardStyles';

/**
 * Where the transaction table hands over to stacked rows. Its own boundary rather than one of the
 * shared ones in `listBreakpoints`: a history row is three columns, so it holds its table shape
 * well past the width the six-column asset tables give up at. Resolved once, in `HistoryWrapper`.
 */
export const HISTORY_CARDS_BELOW: Breakpoint = 'md';

/**
 * Geometry shared by a transaction row, the date heading above it, and the loading skeleton that
 * stands in for both — spelled out once so the three can't stop lining up, which is the only
 * thing the skeleton exists to do.
 */
export const HISTORY_ROW_PX = { xs: 4, xsm: 5 };
export const HISTORY_ROW_MIN_HEIGHT = 72;

export const HISTORY_ACTION_COLUMN = { maxWidth: 200, minWidth: 140, p: 0 } as const;
export const HISTORY_DETAILS_COLUMN = { isRow: true, flex: 2, p: 0 } as const;
export const HISTORY_ACTIONS_COLUMN = { align: 'right', maxWidth: 200, p: 0 } as const;

/**
 * Section heading above each day's transactions (and its skeleton stand-in): the shared card
 * header band, inset to match the rows under it. Takes its text bare — the band supplies the type.
 */
export const HistoryDateHeading = ({ children }: { children: ReactNode }) => (
  <Box sx={{ ...cardHeadingSx, ...cardHeaderBandSx, ...cardHeaderTitleSx, px: HISTORY_ROW_PX }}>
    {children}
  </Box>
);
