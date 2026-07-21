import { SxProps, Theme } from '@mui/material';

/**
 * Icon-only button styling: a square button — no min-width, equal 0.25rem padding on all
 * sides. Compose it in `sx` on top of any Button variant/size (it only adjusts sizing):
 *
 *   <Button variant="outlined" size="small" sx={iconButtonSx}>
 *     <SomeIcon />
 *   </Button>
 */
export const iconButtonSx: SxProps<Theme> = {
  minWidth: 0,
  p: '0.25rem',
};
