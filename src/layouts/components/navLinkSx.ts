import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { figVars } from 'src/utils/figmaColors';

export const NAV_LINK_PADDING_Y = '2.25rem';
export const NAV_LINK_PADDING_X = '0.8125rem';

/**
 * Shared style for the top-nav links — the NavItems entries and the Staking menu trigger.
 * `fg-3` by default, animating to `fg-1` when active or hovered (no background change), plus a
 * static underline shown only for the active page. Only the padding differs between call sites.
 */
export const navLinkSx = (paddingY: string, paddingX: string): SystemStyleObject<Theme> => ({
  color: figVars['fg-3'],
  letterSpacing: '-0.00563rem',
  p: `${paddingY} ${paddingX}`,
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
    height: '2px',
    bottom: '0',
    left: paddingX,
    right: paddingX,
    background: figVars['purple-1'],
    opacity: 0,
  },
});
