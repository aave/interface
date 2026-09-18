import { SxProps, Theme } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';

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

/**
 * A header band sitting above a table's rows — a card's own header, or a section heading partway
 * down it. Vertical rhythm, the table surface, and the hairline drawn as an inset shadow so it
 * doesn't add to the box height. Horizontal inset is deliberately left out: each consumer matches
 * it to the rows underneath. Defined once so the bands can't drift, as `pageBandSx` is for the
 * two page headers.
 */
export const cardHeaderBandSx = {
  py: { xs: '0.875rem', xsm: '1rem' },
  bgcolor: 'table-bg',
  boxShadow: `inset 0 -1px 0 ${figVars['border-0']}`,
} satisfies SxProps<Theme>;

/** The type a header band imposes on its title, whatever heading variant the consumer passes. */
export const cardHeaderTitleSx = {
  color: 'fg-1',
  fontSize: '1rem',
  fontWeight: 500,
  lineHeight: '1.125rem',
} satisfies SxProps<Theme>;

/** Stat label inside the staking panels: smaller and muted from `xsm`, larger and full-ink below. */
export const panelStatLabelSx: SxProps<Theme> = {
  typography: { xs: 'description', xsm: 'subheader2' },
  color: { xs: 'fg-1', xsm: 'fg-2' },
};
