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
