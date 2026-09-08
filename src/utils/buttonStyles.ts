import { SxProps, Theme } from '@mui/material';

/**
 * Icon-only button styling: a square button — no min-width, equal 0.25rem padding on all
 * sides, and a fixed 0.5rem radius regardless of button size. Compose it in `sx` on top of
 * any Button variant/size (it only adjusts sizing):
 *
 *   <Button variant="tertiary" size="small" sx={iconButtonSx}>
 *     <SomeIcon />
 *   </Button>
 */
export const iconButtonSx = {
  minWidth: 0,
  p: '0.25rem',
  // Square: match the width to the button's own height (set by its size slot) so it's a square
  // whatever the icon's width — otherwise a medium button (36px tall) with an 18px icon renders
  // as a tall rectangle.
  aspectRatio: '1',
  // Fixed radius even at size="small" (whose slot would otherwise apply 0.375rem); sx wins
  // over the theme's per-size styleOverride.
  borderRadius: '0.5rem',
  // `satisfies` (not a `SxProps` annotation) keeps the narrow literal type so this can also be
  // composed inside an `sx` array — e.g. `sx={[iconButtonSx, { ... }]}`.
} satisfies SxProps<Theme>;

/** Row action button in the sGHO / stkGHO deposit rows: full-width on mobile, fixed from `xsm`. */
export const depositRowActionSx = {
  minWidth: { xs: '140px', xsm: '96px' },
  height: '36px',
  width: { xs: '100%', xsm: 'auto' },
} satisfies SxProps<Theme>;

/** Row action button in the staking panels: full-width on mobile, fixed from `xsm`. */
export const stakePanelActionSx = {
  minWidth: '96px',
  mb: { xs: 6, xsm: 0 },
  width: { xs: '100%', xsm: 'auto' },
} satisfies SxProps<Theme>;

/** Outer shell of an sGHO / stkGHO deposit row: identity on the left, actions on the right. */
export const depositRowSx = {
  display: 'flex',
  alignItems: { xs: 'stretch', xsm: 'center' },
  justifyContent: 'space-between',
  flexDirection: { xs: 'column', xsm: 'row' },
  gap: 4,
  borderRadius: { xs: '8px', xsm: '6px' },
  p: 4,
  mb: 6,
} satisfies SxProps<Theme>;

/** The APR block + action buttons of a deposit row; the buttons take their own line on mobile. */
export const depositRowActionsSx = {
  display: 'flex',
  flexDirection: { xs: 'column', xsm: 'row' },
  alignItems: { xs: 'stretch', xsm: 'center' },
  justifyContent: { xs: 'flex-start', xsm: 'flex-end' },
  gap: { xs: '1rem', xsm: '0.75rem' },
  flexShrink: 0,
} satisfies SxProps<Theme>;
