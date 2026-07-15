/**
 * Figma color tokens — same names as the old figma.scss `$colors-light` / `$colors-dark` maps.
 *
 * Import into src/utils/theme.tsx and reference when building the palette, e.g.:
 *   import { figmaColor } from './figmaColors';
 *   // ...inside getDesignTokens(mode):
 *   text: { primary: figmaColor(mode, 'fg-1') }
 *
 * Or use the maps directly with the theme's getColor helper:
 *   import { figmaLight, figmaDark } from './figmaColors';
 *   primary: { main: getColor(figmaLight['fg-1'], figmaDark['fg-1']) }
 */
export const figmaLight = {
  'bg-max': '#ffffff',
  'bg-1': '#fafafa',
  'bg-2': '#fcfcfc',
  'bg-3': '#fcfbfb',
  'bg-4': '#f6f7f4',
  'bg-5': '#f6f5f5',
  'bg-6': '#f2efef',
  'border-0': 'rgba(0, 0, 0, 0.06)',
  'border-1': 'rgba(0, 0, 0, 0.08)',
  'border-2': 'rgba(0, 0, 0, 0.12)',
  'fg-max': '#000000',
  'fg-1': '#201d1d',
  'fg-2': '#666666',
  'fg-3': '#858585',
  'fg-4': '#bcbbbb',
  'fg-5': '#cfcece',
  selected: 'rgba(46, 15, 15, 0.04)',
  'blue-1': '#1a88f8',
  'blue-2': '#48abff',
  'blue-3': '#a9e7ff',
  'yellow-1': '#ffb200',
  'yellow-2': '#ffd631',
  'yellow-3': '#fff798',
  'red-1': '#f24900',
  'red-2': '#ff8947',
  'red-3': '#ffc693',
  'purple-1': '#9391f7',
  'purple-2': '#bcbbff',
  'purple-3': '#e2e0ff',
  'green-1': '#1f807b',
  'green-2': '#63bbb6',
  'green-3': '#9debe7',
  'cyan-1': '#6bcef5',
  'cyan-2': '#b5e7fa',
  'cyan-3': '#dff6ff',
  'navy-1': '#1c4886',
  'navy-2': '#6188c0',
  'navy-3': '#b0d3ff',
  'shadow-low': 'rgba(0, 0, 0, 0.02)',
  'shadow-medium': 'rgba(46, 15, 15, 0.05)',
  'shadow-high': 'rgba(46, 15, 15, 0.07)',
  'shadow-strong': 'rgba(46, 15, 15, 0.12)',
  'shadow-stroke-1': 'rgba(46, 15, 15, 0.08)',
  'shadow-stroke-2': 'rgba(0, 0, 0, 0.08)',
  ethereum: '#25292e',
  focus: 'rgba(26, 136, 248, 0.2)',
  scrim: 'rgba(247, 246, 246, 0.8)',
  'data-red': '#ff383c',
  'data-orange': '#e2a48d',
  'data-yellow': '#e3da8d',
  'data-lime': '#c1e38d',
  'data-green': '#6dbc98',
  'data-teal': '#8de3cc',
  'data-blue': '#8dcfe3',
  'data-purple': '#bcbbff',
  'data-pink': '#e1a4d9',
  'button-hover': 'rgba(0, 0, 0, 0.025)',
  'data-green-gho': '#5dff93',
  'chain-testnet': '#8594ab',
  'chain-ethereum': '#25292e',
  'chain-polygon': '#8347e5',
  'chain-base': '#0052ff',
  'chain-optimism': '#e84142',
  'chain-lens': '#36a136',
  'chain-arbitrum': '#28a0f0',
  'chain-blast': '#ffc700',
  'chain-scroll': '#f8cf6e',
  'chain-worldchain': '#ff9d00',
  'chain-zksync': '#8c8dfe',
} as const;

export const figmaDark = {
  'bg-max': '#0a0a0a',
  'bg-1': '#100f0f',
  'bg-2': '#1a1919',
  'bg-3': '#1f1e1e',
  'bg-4': '#2a2828',
  'bg-5': '#393737',
  'bg-6': '#494646',
  'border-0': 'rgba(255, 255, 255, 0.06)',
  'border-1': 'rgba(255, 255, 255, 0.08)',
  'border-2': 'rgba(255, 255, 255, 0.12)',
  'fg-max': '#ffffff',
  'fg-1': '#ffffff',
  'fg-2': '#bcbbbb',
  'fg-3': '#8f8e8e',
  'fg-4': '#636161',
  'fg-5': '#383838',
  selected: 'rgba(255, 255, 255, 0.06)',
  'blue-1': '#1a88f8',
  'blue-2': '#48abff',
  'blue-3': '#a9e7ff',
  'yellow-1': '#ffc42c',
  'yellow-2': '#ffd631',
  'yellow-3': '#fff7ae',
  'red-1': '#f24900',
  'red-2': '#ff8947',
  'red-3': '#ffc693',
  'purple-1': '#9391f7',
  'purple-2': '#bcbbff',
  'purple-3': '#e2e0ff',
  'green-1': '#1f807b',
  'green-2': '#63bbb6',
  'green-3': '#9debe7',
  'cyan-1': '#6bcef5',
  'cyan-2': '#b5e7fa',
  'cyan-3': '#dff6ff',
  'navy-1': '#1c4886',
  'navy-2': '#6188c0',
  'navy-3': '#b0d3ff',
  'data-red': '#d34d63',
  'data-orange': '#e68662',
  'data-yellow': '#fdc75a',
  'data-lime': '#c1e38d',
  'data-green': '#66c399',
  'data-teal': '#8de3cc',
  'data-blue': '#88d5ed',
  'data-purple': '#a5a3ff',
  'data-pink': '#e1a4d9',
  'shadow-low': 'rgba(0, 0, 0, 0.15)',
  'shadow-medium': 'rgba(0, 0, 0, 0.3)',
  'shadow-high': 'rgba(0, 0, 0, 0.35)',
  'shadow-strong': 'rgba(0, 0, 0, 0.5)',
  'shadow-stroke-1': 'rgba(255, 255, 255, 0.08)',
  'shadow-stroke-2': 'rgba(255, 255, 255, 0.08)',
  ethereum: '#434b55',
  focus: 'rgba(85, 167, 251, 0.3)',
  scrim: 'rgba(71, 67, 67, 0.8)',
  'button-hover': 'rgba(255, 255, 255, 0.025)',
  'table-item-hover-1': '#1e1d1d',
  'table-item-hover-2': '#282727',
  'data-green-gho': '#5dff93',
  'wallet-modal-more-networks-label': 'rgba(255, 255, 255, 0.4)',
  'chain-testnet': '#bfc6d1',
  'chain-ethereum': '#7e8287',
  'chain-polygon': '#8347e5',
  'chain-base': '#0052ff',
  'chain-optimism': '#e84142',
  'chain-lens': '#36a136',
  'chain-arbitrum': '#28a0f0',
  'chain-blast': '#ffc700',
  'chain-scroll': '#f8cf6e',
  'chain-worldchain': '#ff9d00',
  'chain-zksync': '#8c8dfe',
} as const;

// Token names shared by both modes (light is the common subset; dark adds a few extras).
export type FigmaColorName = keyof typeof figmaLight;

/** Resolve a single Figma color token for the active mode. */
export const figmaColor = (mode: 'light' | 'dark', name: FigmaColorName) =>
  mode === 'dark' ? figmaDark[name] : figmaLight[name];

/**
 * Pick the whole token map for a mode — the terse way to build the palette:
 *   const t = pickFigma(mode);
 *   text: { primary: t['fg-1'], secondary: t['fg-2'] }
 */
export const pickFigma = (mode: 'light' | 'dark') => (mode === 'dark' ? figmaDark : figmaLight);

/**
 * The shared "surface" box-shadow: a soft drop shadow plus a 1px ring that stands in
 * for a border. Used by the secondary buttons, menus/paper, and the dashboard cards.
 * `stroke` selects the ring token (cards use `shadow-stroke-1` for a slightly stronger hairline).
 */
export const figSurfaceShadow = (
  fig: Record<FigmaColorName, string>,
  stroke: FigmaColorName = 'shadow-stroke-2'
): string => `0px 2px 4px 0px ${fig['shadow-low']}, 0px 0px 0px 1px ${fig[stroke]}`;
