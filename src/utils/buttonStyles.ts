import { SxProps, Theme } from '@mui/material';

/**
 * Icon-only button styling: a square button — no min-width, equal 0.25rem padding on all
 * sides, and a fixed 0.5rem radius regardless of button size. Compose it in `sx` on top of
 * any Button variant/size:
 *
 *   <Button variant="tertiary" size="small" sx={iconButtonSx}>
 *     <SomeIcon />
 *   </Button>
 */
export const iconButtonSx = {
  minWidth: 0,
  p: '0.25rem',
  // An icon arriving through the `startIcon`/`endIcon` slot carries MUI's label-side margins,
  // which push it off centre once the label is gone. No-op when the icon is a plain child.
  '& .MuiButton-startIcon, & .MuiButton-endIcon': { mx: 0 },
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

/**
 * Resizes a Button's icon glyph.
 *
 * MUI sizes it per button size through `.MuiButton-{start,end}Icon > *:nth-of-type(1)` —
 * specificity (0,2,0), which outranks an `sx` on the icon element itself at (0,1,0). So `<Button
 * startIcon={<X sx={{ fontSize: 18 }} />}>` silently renders at MUI's size; the override has to
 * come back through the same selector.
 */
const iconSlotSizeSx = (slot: 'startIcon' | 'endIcon', fontSize: string) => ({
  [`& .MuiButton-${slot} > *:nth-of-type(1)`]: { fontSize },
});

export const startIconSizeSx = (fontSize: string) => iconSlotSizeSx('startIcon', fontSize);

/**
 * Same for the trailing slot. Note the pill variants only tint `.MuiButton-startIcon` to fg-3, so
 * an end icon also needs its colour set on the icon itself (see `ExternalLinkButton`).
 */
export const endIconSizeSx = (fontSize: string) => iconSlotSizeSx('endIcon', fontSize);

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

/**
 * Shared by the deposit row shell and both groups inside it: stacked and full-width on a phone, a
 * centred row from `xsm`. One definition, so the three can never start stacking at different
 * widths and leave a group laid out across the shell's axis.
 */
const stackUntilXsm = {
  display: 'flex',
  flexDirection: { xs: 'column', xsm: 'row' },
  alignItems: { xs: 'stretch', xsm: 'center' },
} satisfies SxProps<Theme>;

/** Outer shell of an sGHO / stkGHO deposit row: identity on the left, actions on the right. */
export const depositRowSx = {
  ...stackUntilXsm,
  justifyContent: 'space-between',
  gap: 4,
  borderRadius: { xs: '8px', xsm: '6px' },
  p: 4,
  mb: 6,
} satisfies SxProps<Theme>;

/**
 * The two side-by-side action buttons at the foot of a mobile list card (and their skeleton).
 * Both children are `fullWidth`, so the row never has free space to distribute and the gap is
 * the only thing separating them.
 */
export const mobileCardActionsSx = {
  display: 'flex',
  gap: '0.75rem',
  mt: 5,
} satisfies SxProps<Theme>;

/** A deposit row's metric and its action group, which takes its own line on mobile. */
export const depositRowActionsSx = {
  ...stackUntilXsm,
  justifyContent: { xs: 'flex-start', xsm: 'flex-end' },
  gap: { xs: '1rem', xsm: '1.5rem' },
  flexShrink: 0,
} satisfies SxProps<Theme>;

/**
 * Groups a deposit row's buttons so they stay a tighter cluster than `depositRowActionsSx`
 * puts between them and the metric. Only needed where a row has more than one button.
 */
export const depositRowButtonsSx = {
  ...stackUntilXsm,
  gap: { xs: '1rem', xsm: '0.75rem' },
} satisfies SxProps<Theme>;
