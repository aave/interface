import { FigmaColorName } from 'src/utils/figmaColors';

/**
 * TEMPORARY (delete with `ColorRegressionSection`).
 *
 * The bg/fg token values as they were *before* the v3 neutral-ramp update, kept here purely so the
 * audit page can render an old-vs-new swatch pair. This is the one place in the codebase allowed to
 * hand-write hex — the whole point is to show a value that no longer exists in `figmaColors.ts`.
 * Nothing outside this dev-only section may import it.
 */
export interface TokenDelta {
  name: FigmaColorName;
  /** Pre-change light value. */
  prevLight: string;
  /** Pre-change dark value. */
  prevDark: string;
}

export const BG_DELTAS: TokenDelta[] = [
  { name: 'bg-max', prevLight: '#ffffff', prevDark: '#0a0a0a' },
  { name: 'bg-1', prevLight: '#fafafa', prevDark: '#100f0f' },
  { name: 'bg-2', prevLight: '#fcfcfc', prevDark: '#18181B' },
  { name: 'bg-3', prevLight: '#fcfbfb', prevDark: '#1f1e1e' },
  { name: 'bg-4', prevLight: '#f6f7f4', prevDark: '#1F1E1E' },
  { name: 'bg-5', prevLight: '#f2f2f2', prevDark: '#2A2828' },
  { name: 'bg-6', prevLight: '#f1f1f1', prevDark: '#393737' },
  { name: 'bg-7', prevLight: '#ebebeb', prevDark: '#3f3e3e' },
];

export const FG_DELTAS: TokenDelta[] = [
  { name: 'fg-max', prevLight: '#000000', prevDark: '#ffffff' },
  { name: 'fg-1', prevLight: '#201d1d', prevDark: '#ffffff' },
  { name: 'fg-2', prevLight: '#666666', prevDark: '#bcbbbb' },
  { name: 'fg-3', prevLight: '#858585', prevDark: '#727274' },
  { name: 'fg-4', prevLight: '#bcbbbb', prevDark: '#636161' },
  { name: 'fg-5', prevLight: '#cfcece', prevDark: '#383838' },
];

/**
 * The deleted `p`-suffix tokens. `replacedBy` is the same-index token every consumer was repointed
 * to — chosen because each deleted token's *dark* value is exactly the new token's dark value, so
 * dark mode should be pixel-identical and only light mode can shift.
 */
export interface RetiredToken {
  name: string;
  prevLight: string;
  prevDark: string;
  replacedBy: FigmaColorName;
  consumers: string;
}

export const RETIRED_TOKENS: RetiredToken[] = [
  {
    name: 'bgp-1',
    prevLight: '#f7f7f7',
    prevDark: '#0f0f10',
    replacedBy: 'bg-1',
    consumers: 'TopBarNotify surface',
  },
  {
    name: 'bgp-2',
    prevLight: '#fcfcfc',
    prevDark: '#18181B',
    replacedBy: 'bg-2',
    consumers: 'alert dark gradient, checkbox/radio dark fill, MarketSwitcher, MobileMenu, Drawer',
  },
  {
    name: 'bgp-4',
    prevLight: '#f2f2f2',
    prevDark: '#1E1E20',
    replacedBy: 'bg-4',
    consumers: 'none — was orphaned, deleted outright',
  },
  {
    name: 'bgp-5',
    prevLight: '#f6f7f4',
    prevDark: '#28282A',
    replacedBy: 'bg-5',
    consumers: 'reserve header icon-button hover',
  },
  {
    name: 'fgp-3',
    prevLight: '#8b8b8d',
    prevDark: '#8f8e8e',
    replacedBy: 'fg-3',
    consumers: 'TopInfoPanelItem, Bridge modal link icon, GovernanceTopPanel link icon',
  },
];
