import { Breakpoint } from '@mui/material';
import { ENABLE_TESTNET, FORK_ENABLED } from 'src/utils/marketsAndNetworksConfig';

export const ENV_BADGE_ENABLED = ENABLE_TESTNET || FORK_ENABLED;

/**
 * Where the header hands over to its mobile layout. `AppHeader` and `NavItems` both branch on
 * this and must agree — if they disagree, the drawer renders the desktop nav row.
 */
export const HEADER_MOBILE_BELOW: Breakpoint = ENV_BADGE_ENABLED ? 'lg' : 'mdlg';

/**
 * Where the header's action triggers collapse to icon-only. Independent of the handover above:
 * an env badge takes the space immediately, so it forces the collapsed form at any width.
 */
export const HEADER_COLLAPSE_BELOW: Breakpoint = 'lg';

/** Header height. The mobile drawer offsets itself by this, so the two must agree. */
export const HEADER_HEIGHT = 72;
