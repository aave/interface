import { SxProps, Theme } from '@mui/material';

/**
 * Standard padding for a `Paper variant="card"` panel: a tighter top than sides, and 16px sides on
 * mobile stepping to 24px from `xsm`. Kept out of the `card` variant itself because several cards
 * pad an inner Box instead and would double up.
 *
 *   <Paper variant="card" sx={cardPaddingSx}>
 */
export const cardPaddingSx: SxProps<Theme> = {
  pt: 4,
  pb: { xs: 4, xsm: 6 },
  px: { xs: 4, xsm: 6 },
};

/**
 * Card heading row: reserves the header band's height so a panel's header does not change height
 * depending on whether an action button shares the row.
 */
export const CARD_HEADING_HEIGHT = '36px';

export const cardHeadingSx = {
  minHeight: CARD_HEADING_HEIGHT,
  display: 'flex',
  alignItems: 'center',
} satisfies SxProps<Theme>;
