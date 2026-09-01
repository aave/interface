import { CSSObject, Theme } from '@mui/material/styles';

import { motion } from './motion';

interface InsetHighlightOpts {
  /** Only `transitions` is read — accepts the app theme or a plain MUI `Theme`. */
  theme: Pick<Theme, 'transitions'>;
  /** Corner radius of the highlight pseudo-element. */
  radius: string | number;
  /** Even inset applied to every side; overridden per-side by the props below. */
  inset?: string | number;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  /** Resting scale the highlight grows in from on activation (default 0.96). */
  restScale?: number;
  /**
   * When set, the highlight is "on" at rest — a persistent selected state: full scale and this
   * fill, rather than transparent-until-hover. Leave undefined for hover-only rows so no
   * `background-color` is emitted at rest.
   */
  restFill?: string;
}

/**
 * The inset-pseudo highlight recipe shared by the dropdown menu items (`MuiMenuItem` in
 * `theme.tsx`) and the market-switcher option rows (`MarketSwitcher.tsx`). Draws the
 * hover/selected fill on a `::before` inset from the row's edges — so adjacent highlights keep a
 * visual gap while the physical row is unchanged — sitting behind the row's content
 * (`zIndex: -1` under `isolation: isolate`) and growing in from `restScale` → 1.
 *
 * Pair with {@link insetHighlightActive} under the consumer's own hover/focus/selected selectors
 * to set the fill and final scale (the trigger selectors differ per consumer: MUI classes for
 * MenuItem, `:hover` + a JS boolean for the switcher).
 */
export const insetHighlightBase = ({
  theme,
  radius,
  inset,
  top,
  right,
  bottom,
  left,
  restScale = 0.96,
  restFill,
}: InsetHighlightOpts): CSSObject => ({
  position: 'relative',
  isolation: 'isolate',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: top ?? inset ?? 0,
    right: right ?? inset ?? 0,
    bottom: bottom ?? inset ?? 0,
    left: left ?? inset ?? 0,
    zIndex: -1,
    borderRadius: radius,
    transform: restFill ? 'scale(1)' : `scale(${restScale})`,
    transition: theme.transitions.create(['transform', 'background-color'], {
      duration: motion.duration.hover,
    }),
    // Only emit a resting fill when persistently "on" — hover-only consumers (and the MenuItem
    // refactor) stay identical, with no `background-color` until their own trigger fires.
    ...(restFill ? { backgroundColor: restFill } : {}),
  },
});

/**
 * The "on" state for an {@link insetHighlightBase} highlight: the fill plus the grown-in scale.
 * Apply under the consumer's hover / keyboard-focus / selected selectors, e.g.
 * `'&:hover::before': insetHighlightActive(figVars['button-hover'])`.
 */
export const insetHighlightActive = (fill: string): CSSObject => ({
  backgroundColor: fill,
  transform: 'scale(1)',
});
