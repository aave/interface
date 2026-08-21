import { FigmaColorName, pickFigma } from 'src/utils/figmaColors';

const LIGHT = pickFigma('light');
const DARK = pickFigma('dark');

/**
 * Normalise a token's source value for display: hex uppercased to match how Figma shows it,
 * `rgba()`/`hsl()` left exactly as authored. `figmaColors.ts` has mixed casing (`#18181B` next to
 * `#0a0a0a`), so without this the same token can read differently on two showcase pages.
 */
const formatColor = (value: string) => (value.startsWith('#') ? value.toUpperCase() : value);

/** Monospace so hex digits line up when scanning a column of tokens. */
export const HEX_TEXT = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  letterSpacing: 0,
} as const;

/** Both modes' source values for a token, display-normalised. */
export const tokenHex = (name: FigmaColorName) => ({
  light: formatColor(LIGHT[name]),
  dark: formatColor(DARK[name]),
});
