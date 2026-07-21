import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';
import { figVars } from 'src/utils/figmaColors';

/**
 * Shared style for the top-nav links — the NavItems entries and the Staking menu trigger.
 * `fg-3` by default, `fg-1` when active or hovered (no background change), plus an
 * animated underline. Only the padding differs between call sites.
 */
export const navLinkSx = (padding: string): SystemStyleObject<Theme> => ({
  color: figVars['fg-3'],
  letterSpacing: '-0.00563rem',
  p: padding,
  position: 'relative',
  '.active&': {
    color: figVars['fg-1'],
  },
  '&:hover': {
    backgroundColor: 'transparent',
    color: figVars['fg-1'],
  },
  '.active&:after, &:hover&:after': {
    transform: 'scaleX(1)',
    transformOrigin: 'bottom left',
  },
  '&:after': {
    content: "''",
    position: 'absolute',
    width: '100%',
    transform: 'scaleX(0)',
    height: '2px',
    bottom: '0',
    left: '0',
    background: figVars['purple-1'],
    transformOrigin: 'bottom right',
    transition: 'transform 0.25s ease-out',
  },
});
