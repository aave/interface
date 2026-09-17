import { decomposeColor } from '@mui/material/styles';

/**
 * Convert an sRGB color string (hex, `rgb()`, or `rgba()`) to its Display-P3 equivalent
 * using the same naive channel mapping the Figma export uses (channels / 255, relabeled as
 * `color(display-p3 …)`). This matches the design source's P3 values and, on wide-gamut
 * displays, renders saturated colors richer while leaving near-grays visually unchanged.
 *
 * Used to generate the `@supports (color-gamut: p3)` override layer for the theme's CSS
 * variables. Non-color / already-`color()` inputs are returned unchanged.
 */
export const colorToP3 = (color: string): string => {
  if (!color.startsWith('#') && !color.startsWith('rgb')) return color;
  // decomposeColor parses #nnn / #nnnnnn / rgb() / rgba() → { values: [r, g, b, a?] } (r,g,b 0-255).
  const [r, g, b, a] = decomposeColor(color).values;
  const channels = `${r / 255} ${g / 255} ${b / 255}`;
  return a === undefined ? `color(display-p3 ${channels})` : `color(display-p3 ${channels} / ${a})`;
};
