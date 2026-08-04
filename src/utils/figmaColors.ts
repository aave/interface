/**
 * Figma color tokens — the SINGLE SOURCE OF TRUTH for every color value in the app (light +
 * dark). The theme flattens these onto the MUI palette root, so each becomes a `--mui-palette-*`
 * CSS var (Display-P3 + sRGB fallback). Consume them as bare token strings in `sx`
 * (`sx={{ bgcolor: 'bg-1' }}`) or via `figVars` outside `sx` — never hand-write hex in components.
 */
export const figmaLight = {
  'bg-max': '#f0f0f0',
  'bg-1': '#fafafa',
  'bg-2': '#fcfcfc',
  'bg-3': '#ffffff',
  'bg-4': '#ffffff',
  'bg-5': '#f2f2f2',
  'bg-6': '#f1f1f1',
  'bg-7': '#ebebeb',
  'border-0': 'rgba(0, 0, 0, 0.06)',
  'border-1': 'rgba(0, 0, 0, 0.08)',
  'border-2': 'rgba(0, 0, 0, 0.12)',
  'fg-max': '#000000',
  'fg-1': '#000000',
  'fg-2': '#666666',
  'fg-3': '#858585',
  'fg-4': '#a8a8a8',
  'fg-5': '#b3b3b3',
  // Muted icon grey (search, sortable-column chevrons, …). Deliberately mode-agnostic — the same
  // value in both maps — unlike the fg-* ramp steps.
  'fg-icon': '#A8A8A8',
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
  'purple-2': 'hsl(241, 76%, 67%)',
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
  'shadow-medium': 'rgba(0, 0, 0, 0.04)',
  'shadow-high': 'rgba(46, 15, 15, 0.07)',
  'shadow-strong': 'rgba(46, 15, 15, 0.12)',
  'shadow-stroke-1': 'rgba(46, 15, 15, 0.08)',
  'shadow-stroke-2': 'rgba(0, 0, 0, 0.08)',
  ethereum: '#25292e',
  focus: 'rgba(26, 136, 248, 0.2)',
  scrim: 'rgba(247, 246, 246, 0.8)',
  // Data-viz categorical palette (17 hues, red → pink).
  'data-red': '#FF4760',
  'data-coral': '#FF513D',
  'data-orange': '#FF7029',
  'data-honey': '#FF8C00',
  'data-yellow': '#DBA400',
  'data-pear': '#CCAB00',
  'data-light-green': '#22CE80',
  'data-green': '#00BD68',
  'data-matcha': '#89BE2D',
  'data-seafoam': '#00B89F',
  'data-teal': '#05B4C7',
  'data-lagoon': '#12B4D9',
  'data-blue': '#38B0F5',
  'data-azure': '#4797FF',
  'data-purple': '#837AFF',
  'data-lavender': '#C061FF',
  'data-pink': '#EB47CF',
  'button-hover': 'rgba(0, 0, 0, 0.025)',
  'data-green-gho': '#5dff93',
  // Gold for the favourited market star (mode-agnostic; Figma color(display-p3 1 0.7 0)).
  'favourite-star': '#FFB300',
  // Alert "danger" severity red (icon + gradient); distinct from the muted error-* palette.
  danger: '#DC2626',
  // sGHO markets-banner gradient tints — data-green / neutral washes at 6%.
  'sgho-banner-green': 'rgba(50, 201, 88, 0.06)',
  'sgho-banner-fade': 'rgba(255, 255, 255, 0.06)',
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
  'info-panel-color-one': '#fafafa',
  'info-panel-color-two': '#fafafa',
  'info-panel-color-three': '#fafafa',
  bone: '#f6f7f4',
  // Hover fills for the two opaque button surfaces. Each is a SINGLE per-mode token rather than a
  // base + `darkScheme()` override, so it resolves to the NEAREST color scheme — the dev showcase's
  // local toggle works even when the app's global scheme differs (the dark selector matches any
  // ancestor, including <html>, so a two-token swap leaks across a nested scheme boundary).
  // fg-max-hover: light = a warm near-black (a step off the pure-#000 fg-max base); dark = bone.
  // bg-4-hover: one step down the ramp from the bg-4 control surface, per mode.
  'fg-max-hover': '#201d1d',
  'bg-4-hover': '#f6f7f4',
  // --- semantic tokens promoted from theme-file literals (SoT) ---
  'secondary-main': '#FF607B',
  'secondary-light': '#FF607B',
  'secondary-dark': '#B34356',
  'error-light': '#D26666',
  'error-dark': '#BC0000',
  'error-text': '#4F1919',
  'error-bg': '#F9EBEB',
  'warning-light': '#FFCE00',
  'warning-dark': '#C67F15',
  'warning-text': '#63400A',
  'warning-bg': '#FEF5E8',
  'info-light': '#0062D2',
  'info-dark': '#002754',
  'info-text': '#002754',
  'info-bg': '#E5EFFB',
  'success-light': '#90FF95',
  'success-dark': '#318435',
  'success-text': '#1C4B1E',
  'success-bg': '#ECF8ED',
  'disabled-fg': '#BBBECA',
  'disabled-bg': '#EAEBEF',
  'input-line': '#383D511F',
  'input-border-hover': '#CBCDD8',
  'surface-elevated': '#ffffff',
} as const;

export const figmaDark = {
  'bg-max': '#0a0a0b',
  'bg-1': '#0f0f10',
  'bg-2': '#18181b',
  'bg-3': '#18181b',
  'bg-4': '#1e1e20',
  'bg-5': '#28282a',
  'bg-6': '#36363a',
  'bg-7': '#45454a',
  'border-0': 'rgba(255, 255, 255, 0.06)',
  'border-1': 'rgba(255, 255, 255, 0.08)',
  'border-2': 'rgba(255, 255, 255, 0.12)',
  'fg-max': '#ffffff',
  'fg-1': '#ffffff',
  'fg-2': '#bcbbbb',
  'fg-3': '#8f8e8e',
  'fg-4': '#636161',
  'fg-5': '#ffffff',
  // Muted icon grey (search, sortable-column chevrons, …). Deliberately mode-agnostic — the same
  // value in both maps — unlike the fg-* ramp steps.
  'fg-icon': '#A8A8A8',
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
  'purple-1': '#9391ff',
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
  'data-red': '#E05269',
  'data-coral': '#FF7045',
  'data-orange': '#E68662',
  'data-honey': '#F59942',
  'data-yellow': '#FDC75A',
  'data-pear': '#FFE042',
  'data-light-green': '#C1E38D',
  'data-green': '#66C399',
  'data-matcha': '#92D492',
  'data-seafoam': '#78D3B3',
  'data-teal': '#8DE3CC',
  'data-lagoon': '#83DDDF',
  'data-blue': '#88D5ED',
  'data-azure': '#88C0FE',
  'data-purple': '#A5A3FF',
  'data-lavender': '#C9A1EF',
  'data-pink': '#E1A4D9',
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
  // Gold for the favourited market star (mode-agnostic; Figma color(display-p3 1 0.7 0)).
  'favourite-star': '#FFB300',
  // Alert "danger" severity red (icon + gradient); distinct from the muted error-* palette.
  danger: '#DC2626',
  // sGHO markets-banner gradient tints — dark data-green / neutral washes at 6%.
  'sgho-banner-green': 'rgba(102, 195, 153, 0.06)',
  'sgho-banner-fade': 'rgba(255, 255, 255, 0.06)',
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
  'info-panel-color-one': 'rgba(29, 29, 33, 0.20)',
  'info-panel-color-two': 'rgba(41, 41, 46, 0.20)',
  'info-panel-color-three': 'rgba(255, 255, 255, 0.01)',
  bone: '#f6f7f4',
  'fg-max-hover': '#f6f7f4',
  'bg-4-hover': '#28282a',
  // --- semantic tokens promoted from theme-file literals (SoT) ---
  'secondary-main': '#F48FB1',
  'secondary-light': '#F6A5C0',
  'secondary-dark': '#AA647B',
  'error-light': '#E57373',
  'error-dark': '#D32F2F',
  'error-text': '#FBB4AF',
  'error-bg': '#2E0C0A',
  'warning-light': '#FFB74D',
  'warning-dark': '#F57C00',
  'warning-text': '#FFDCA8',
  'warning-bg': '#301E04',
  'info-light': '#4FC3F7',
  'info-dark': '#0288D1',
  'info-text': '#A9E2FB',
  'info-bg': '#071F2E',
  'success-light': '#90FF95',
  'success-dark': '#388E3C',
  'success-text': '#C2E4C3',
  'success-bg': '#0A130B',
  'disabled-fg': '#EBEBEF4D',
  'disabled-bg': '#EBEBEF1F',
  'input-line': '#EBEBEF6B',
  'input-border-hover': '#CBCDD8',
  'surface-elevated': '#1E1E20',
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
export const pickFigma = (mode: 'light' | 'dark'): Record<FigmaColorName, string> =>
  mode === 'dark' ? figmaDark : figmaLight;

/**
 * Terse, P3-safe accessor for the design tokens as CSS variables.
 *
 * The tokens are flattened onto the MUI palette root (see `theme.tsx`), so MUI generates a
 * `--mui-palette-<name>` custom property per token and the Display-P3 layer overrides those on
 * wide-gamut displays. `figVars['bg-1']` therefore emits `var(--mui-palette-bg-1)`, which gets
 * P3 + the structural sRGB fallback — unlike a raw `theme.palette['bg-1']` hex read, which does
 * not. Use it in `styled()`, plain JS, and interpolated strings; inside `sx` the bare string
 * form (`sx={{ bgcolor: 'bg-1' }}`) already resolves to the same var with no import.
 *
 * Gotcha: never pass a var-based color (this, a bare `sx` token, or `theme.vars.palette.*`) to a
 * raw SVG/icon presentation attribute (`<Icon color=/fill=/stroke={…}>`) — `var()` doesn't
 * resolve there. Use a concrete hex, or apply the color via `sx`/`style` (CSS) instead.
 *
 * The `--mui-palette-<name>` naming is coupled to MUI's var generation and to the tokens living
 * at the palette root — the same coupling `collectP3Vars` (theme.tsx) relies on.
 */
export const figVars = Object.fromEntries(
  Object.keys(figmaLight).map((name) => [name, `var(--mui-palette-${name})`])
) as Record<FigmaColorName, string>;

/**
 * Always-white, mode-independent. For text/icons that sit on a fixed colored surface (brand
 * gradients, always-dark chips). A concrete hex — NOT a CSS var — so it also resolves in raw
 * SVG/icon presentation attributes (`color=`/`fill=`), where `var()` does not.
 */
export const onAccent = '#ffffff';

/**
 * The shared "surface" box-shadow: a soft drop shadow plus a 1px ring that stands in
 * for a border. Used by the secondary buttons, menus/paper, and the dashboard cards.
 * `stroke` selects the ring token (cards use `shadow-stroke-1` for a slightly stronger hairline).
 */
export const figSurfaceShadow = (stroke: FigmaColorName = 'shadow-stroke-2'): string =>
  `0px 2px 4px 0px ${figVars['shadow-low']}, 0px 0px 0px 1px ${figVars[stroke]}`;
