/**
 * Central motion tokens — the single source of truth for overlay/dialog animation
 * timing across the app. Consumed by the theme's transition defaults and by the
 * shared transition components (e.g. `ScaleFade`). Values mirror the reference
 * project's overlay "feel": a fast, subtle pop.
 *
 * Kept in its own module (rather than in `theme.tsx`) so shared transitions can read
 * these tokens without importing `theme.tsx`, which would create an import cycle
 * (`theme` → `ScaleFade` → `theme`).
 */
export const motion = {
  duration: {
    /** dropdowns, menus, selects, popovers */
    overlay: 100,
    /** interactive control feedback — button hover/focus state transitions */
    hover: 100,
    /** modal enter/exit — reserved for Phase 2 (modals are not animated yet) */
    modal: 200,
    /** mobile modal slide-up — reserved for Phase 2/3 */
    modalMobile: 300,
  },
  easing: {
    standard: 'ease',
    smooth: 'cubic-bezier(0.19, 1, 0.22, 1)',
  },
} as const;
