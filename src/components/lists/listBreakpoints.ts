import { Breakpoint } from '@mui/material';

/**
 * Where a list hands over from a table of rows to stacked mobile cards. Each list branches on
 * one of these in several places at once — the row component, the column header, and the
 * skeleton loader — so they must agree or the header outlives its rows.
 *
 * Two boundaries because the two families are different widths: the dashboard's paired cards
 * run out of room for a table at `xsm`, while the full-width tables hold out to `mdlg`.
 */
export const LIST_CARDS_BELOW: Breakpoint = 'xsm';
export const TABLE_CARDS_BELOW: Breakpoint = 'mdlg';
