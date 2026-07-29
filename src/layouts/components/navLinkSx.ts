import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { figVars } from 'src/utils/figmaColors';

/**
 * Shared style for the top-nav links — the NavItems entries and the Staking menu trigger.
 * `fg-3` by default, animating to `fg-1` when active or hovered (no background change), plus a
 * static underline shown only for the active page. Only the padding differs between call sites.
 */
export const navLinkSx = (padding: string): SystemStyleObject<Theme> => ({
  color: figVars['fg-3'],
  letterSpacing: '-0.00563rem',
  p: padding,
  position: 'relative',
  transition: 'color 0.25s ease-out', // only the text color animates
  '.active&': {
    color: figVars['fg-1'],
  },
  // An open dropdown trigger ([aria-expanded="true"], e.g. the Staking menu) keeps the fg-1 text color (but not the underline).
  '&:hover, &[aria-expanded="true"]': {
    backgroundColor: 'transparent',
    color: figVars['fg-1'],
  },
  // Static underline: shown for the active page only — not on hover or when a dropdown is open, no animation.
  '.active&:after': {
    opacity: 1,
  },
  '&:after': {
    content: "''",
    position: 'absolute',
    width: '100%',
    height: '2px',
    bottom: '0',
    left: '0',
    background: figVars['purple-1'],
    opacity: 0,
  },
});
