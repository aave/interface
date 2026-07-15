import { Theme } from '@mui/material';
import { SystemStyleObject } from '@mui/system';

/**
 * Shared style for the top-nav links — the NavItems entries and the Staking menu trigger.
 * `fig-3` by default, `fig-1` when active or hovered (no background change), plus an
 * animated underline. Only the padding differs between call sites.
 */
export const navLinkSx = (theme: Theme, padding: string): SystemStyleObject<Theme> => ({
  color: theme.palette.fig['fg-3'],
  letterSpacing: '-0.00563rem',
  p: padding,
  position: 'relative',
  '.active&': {
    color: theme.palette.fig['fg-1'],
  },
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.fig['fg-1'],
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
    background: theme.palette.fig['purple-1'],
    transformOrigin: 'bottom right',
    transition: 'transform 0.25s ease-out',
  },
});
