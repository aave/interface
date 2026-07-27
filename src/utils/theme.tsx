import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline';
import { Box, SvgIcon, ThemeOptions } from '@mui/material';
import { type CSSObject, createTheme, experimental_extendTheme } from '@mui/material/styles';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ColorPartial } from '@mui/material/styles/createPalette';
// Augments MUI's base `Theme` (the one component `sx`/`styled` callbacks receive) with `.vars`,
// so `theme.vars.palette.*` typechecks app-wide, not only against this file's `AppTheme` param.
import type {} from '@mui/material/themeCssVarsAugmentation';
import React from 'react';
import { ChevronUpDownIcon } from 'src/components/icons/ChevronUpDownIcon';
import { ScaleFade } from 'src/components/primitives/transitions/ScaleFade';

import { colorToP3 } from './colorToP3';
import { type FigmaColorName, figSurfaceShadow, figVars, onAccent, pickFigma } from './figmaColors';
import { insetHighlightActive, insetHighlightBase } from './insetHighlight';
import { motion } from './motion';

// The app theme is built with MUI's CSS-variables engine (`experimental_extendTheme`), so it
// carries `.vars` (CSS custom-property refs like `figVars['bg-1']`) and
// `.applyStyles(scheme, …)` for per-color-scheme overrides.
type AppTheme = ReturnType<typeof experimental_extendTheme>;

// MUI's `theme.applyStyles('dark', …)` needs the provider theme's `getColorSchemeSelector`,
// which the raw `extendTheme` result (used to build the component overrides statically)
// doesn't carry — so calling it there hits the classic `palette.mode` branch and throws (the
// raw theme has no top-level `palette`). This helper inlines the exact CSS-vars selector
// `applyStyles` emits, matching any ancestor with `data-mui-color-scheme="dark"` — the <html>
// element (app-wide) or a local wrapper (the dev showcase) — so both switch correctly.
const darkScheme = (styles: object) => ({
  '*:where([data-mui-color-scheme="dark"]) &': styles,
});

// Dropdown geometry: the menu paper's corner radius and the list's inset. The option-row
// highlight radius is derived from these (paper radius − inset) to stay concentric, so keep
// them together here — otherwise that relationship silently drifts.
const MENU_PAPER_RADIUS = '0.75rem';
const MENU_LIST_INSET = '0.38rem';

/**
 * Secondary "white pill" style for the `outlined` button variant: a hairline ring instead
 * of a border (bg-max in light, bg-4 in dark) with a subtle fill shift on hover. On hover the
 * ring is re-asserted (the global `disableElevation` default otherwise strips box-shadow),
 * and `border` is forced to none to suppress MUI's default outlined hover border.
 */
const secondaryPillStyle = {
  color: figVars['fg-1'],
  // Different token per mode: bg-max (white) in light, a bg-4 fill in dark.
  backgroundColor: figVars['bg-max'],
  border: 'none',
  boxShadow: figSurfaceShadow(),
  '& .MuiButton-startIcon': {
    color: figVars['fg-3'],
  },
  ...darkScheme({
    backgroundColor: figVars['bg-4'],
  }),
  // Open state (a menu/popover trigger with `aria-expanded="true"`) keeps the hover fill.
  '&:hover, &.Mui-focusVisible, &[aria-expanded="true"]': {
    backgroundColor: figVars['bg-1'],
    // Suppress MUI's default outlined hover border (its `:hover` rule would otherwise
    // re-introduce a 1px border on top of the borderless pill).
    border: 'none',
    boxShadow: figSurfaceShadow(),
    ...darkScheme({
      backgroundColor: figVars['bg-5'],
    }),
  },
};

// Shared box geometry for the custom selection-control icons (checkbox + radio).
const checkboxIconBox = { width: 18, height: 18, borderRadius: '0.375rem' };

// Keyboard-focus ring shared by the buttons and the selection controls / switch: a 2px ring in the
// element's own colour, offset 3px out.
const focusRing = { outline: '2px solid currentColor', outlineOffset: '3px' } as const;

// Selection-control (checkbox + radio) icon recipes — shared so the two never drift. The unchecked
// box is a bg-2 fill with an inset fg-5 hairline that darkens to fg-4 on hover (keyed to the shared
// .MuiButtonBase-root both controls carry, so one selector covers both); the checked box is a
// purple-1 fill centered on its glyph. Radio spreads these and overrides borderRadius to a circle.
const selectionControlResting = {
  ...checkboxIconBox,
  backgroundColor: figVars['bg-2'],
  boxShadow: `inset 0 0 0 1px ${figVars['fg-5']}`,
  boxSizing: 'border-box' as const,
  '.MuiButtonBase-root:hover &': {
    boxShadow: `inset 0 0 0 1px ${figVars['fg-4']}`,
  },
  // Keyboard-focus ring (see `focusRing`), hugging the icon box. The focus class lands on the
  // shared ButtonBase root, so key it off that.
  '.MuiButtonBase-root.Mui-focusVisible &': focusRing,
};
const selectionControlChecked = {
  ...checkboxIconBox,
  backgroundColor: figVars['purple-1'],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // Keyboard-focus ring (see `focusRing`).
  '.MuiButtonBase-root.Mui-focusVisible &': focusRing,
};
const selectionControlRootReset = {
  root: {
    '&:hover, &.Mui-focusVisible': {
      backgroundColor: 'transparent',
    },
  },
};

// Soft shadow under the Switch's thumb.
const controlThumbShadow = '0px 1px 1px rgba(0, 0, 0, 0.12)';

const theme = createTheme();
const {
  typography: { pxToRem },
} = theme;

const FONT = 'Inter, Arial';

declare module '@mui/material/styles/createPalette' {
  interface PaletteColor extends ColorPartial {}

  interface TypeText {
    muted: string;
  }

  interface TypeBackground {
    default: string;
    paper: string;
    surface: string;
  }

  // Design tokens are flattened onto the palette root (see `getDesignTokens`), so each token is
  // a first-class palette member. This also turns a token name that collides with a built-in
  // palette key (e.g. `error`, `background`) into a compile error rather than a silent overwrite.
  interface Palette extends Record<FigmaColorName, string> {}

  interface PaletteOptions extends Partial<Record<FigmaColorName, string>> {}
}

interface TypographyCustomVariants {
  display1: React.CSSProperties;
  subheader1: React.CSSProperties;
  subheader2: React.CSSProperties;
  description: React.CSSProperties;
  buttonL: React.CSSProperties;
  buttonM: React.CSSProperties;
  buttonS: React.CSSProperties;
  helperText: React.CSSProperties;
  secondary21: React.CSSProperties;
  secondary16: React.CSSProperties;
  main12: React.CSSProperties;
}

declare module '@mui/material/styles' {
  interface TypographyVariants extends TypographyCustomVariants {}

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions extends TypographyCustomVariants {}

  interface BreakpointOverrides {
    xsm: true;
    xxl: true;
    mdlg: true;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    display1: true;
    subheader1: true;
    subheader2: true;
    description: true;
    buttonL: true;
    buttonM: true;
    buttonS: true;
    helperText: true;
    secondary21: true;
    secondary16: true;
    main12: true;
    h5: true;
    h6: false;
    subtitle1: false;
    subtitle2: false;
    body1: false;
    body2: false;
    button: false;
    overline: false;
  }
}

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    modal: true;
    card: true;
  }
}

export const getDesignTokens = (mode: 'light' | 'dark') => {
  const t = pickFigma(mode); // ← the one line of setup

  return {
    breakpoints: {
      keys: ['xs', 'xsm', 'sm', 'md', 'lg', 'xl', 'xxl'],
      values: { xs: 0, xsm: 640, sm: 760, md: 960, mdlg: 1125, lg: 1280, xl: 1575, xxl: 1800 },
    },
    palette: {
      mode,
      // Design tokens flattened onto the palette root → MUI generates a `--mui-palette-<name>`
      // var per token, so `sx={{ bgcolor: 'bg-1' }}` and `figVars['bg-1']` both resolve to it.
      ...t,
      primary: {
        main: t['fg-1'],
        light: t['fg-2'],
        dark: t['fg-max'],
        contrastText: t['bg-1'],
      },
      secondary: {
        main: t['secondary-main'],
        light: t['secondary-light'],
        dark: t['secondary-dark'],
      },
      error: {
        main: t['red-1'],
        light: t['error-light'],
        dark: t['error-dark'],
        '100': t['error-text'], // alert text
        '200': t['error-bg'], // alert background
      },
      warning: {
        main: t['yellow-1'],
        light: t['warning-light'],
        dark: t['warning-dark'],
        '100': t['warning-text'],
        '200': t['warning-bg'],
      },
      info: {
        main: t['blue-1'],
        light: t['info-light'],
        dark: t['info-dark'],
        '100': t['info-text'],
        '200': t['info-bg'],
      },
      success: {
        main: t['data-green'],
        light: t['success-light'],
        dark: t['success-dark'],
        '100': t['success-text'],
        '200': t['success-bg'],
      },
      text: {
        primary: t['fg-1'],
        secondary: t['fg-2'],
        disabled: t['fg-4'],
        muted: t['fg-3'],
      },
      background: {
        default: t['bg-5'],
        paper: t['surface-elevated'],
        surface: t['bg-2'],
      },
      divider: t['border-2'],
      action: {
        active: t['fg-3'],
        hover: t['button-hover'],
        selected: t['selected'],
        disabled: t['disabled-fg'],
        disabledBackground: t['disabled-bg'],
        focus: t['focus'],
      },
    },
    spacing: 4,
    typography: {
      fontFamily: FONT,
      h6: undefined,
      subtitle1: undefined,
      subtitle2: undefined,
      body1: undefined,
      body2: undefined,
      button: undefined,
      overline: undefined,
      display1: {
        fontFamily: FONT,
        fontWeight: 700,
        letterSpacing: pxToRem(0.25),
        lineHeight: '123.5%',
        fontSize: pxToRem(32),
      },
      h1: {
        fontFamily: FONT,
        fontWeight: 700,
        letterSpacing: pxToRem(0.25),
        lineHeight: '123.5%',
        fontSize: pxToRem(28),
      },
      h2: {
        fontFamily: FONT,
        fontWeight: 500,
        lineHeight: '120%',
        fontSize: pxToRem(24),
      },
      h3: {
        fontFamily: FONT,
        fontWeight: 500,
        lineHeight: '120%',
        fontSize: pxToRem(18),
      },
      h4: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
      },
      h5: {
        fontFamily: FONT,
        fontWeight: 500,
        lineHeight: pxToRem(18),
        fontSize: pxToRem(14),
      },
      subheader1: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(20),
        fontSize: pxToRem(14),
      },
      subheader2: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
      description: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.15),
        lineHeight: '143%',
        fontSize: pxToRem(14),
      },
      caption: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
      buttonL: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.46),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
      },
      buttonM: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: '-0.00563rem',
        lineHeight: '1.25rem',
        fontSize: pxToRem(14),
      },
      buttonS: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.46),
        lineHeight: pxToRem(20),
        textTransform: 'uppercase',
        fontSize: pxToRem(10),
      },
      helperText: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.4),
        lineHeight: pxToRem(12),
        fontSize: pxToRem(10),
      },
      secondary21: {
        fontFamily: FONT,
        fontWeight: 500,
        lineHeight: '133.4%',
        fontSize: pxToRem(21),
      },
      secondary16: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
      },
      main12: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
    },
  } as ThemeOptions;
};

/**
 * Subtle press feedback shared by buttons and dropdown triggers: the control scales down
 * slightly while active (pointer/touch down), and never when disabled. Pair with a `transform`
 * transition (at `motion.duration.hover`) so the release animates back. Reduced-motion users
 * get the scale instantly via the global `prefers-reduced-motion` rule in MuiCssBaseline.
 */
const pressScaleActive = {
  '&:active:not(.Mui-disabled)': {
    transform: 'scale(0.99)',
  },
};

/**
 * Disabled button treatment: the label/icon stay crisp while the button's own background (+ box
 * shadow) render at 50% on an `opacity: 0.5` `::before` layer. Opacity is used (not color-mix /
 * channel alpha) so the faded fill keeps its Display-P3 color; a box-shadow also has no opacity of
 * its own, so fading a layer is the only clean way to halve it. `isolation: isolate` makes the root
 * a stacking context so the `z-index: -1` layer sits behind the label, not behind the parent bg.
 */
const disabledFade = (opts: { color: string; before: CSSObject }): CSSObject => ({
  color: opts.color,
  backgroundColor: 'transparent',
  border: 'none',
  boxShadow: 'none',
  isolation: 'isolate',
  '&::before': {
    content: "''",
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 'inherit',
    opacity: 0.5,
    zIndex: -1,
    ...opts.before,
  },
});

export function getThemedComponents(theme: AppTheme) {
  return {
    components: {
      MuiSkeleton: {
        styleOverrides: {
          root: {
            transform: 'unset',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '0.5rem',
            // Text inputs (everything that isn't a Select): a bg-max surface with the shared
            // surface shadow (shadow-low drop + shadow-stroke-2 1px ring) instead of a border.
            // Selects keep their own fill via the `:has(.MuiSelect-select)` block below.
            '&:not(:has(.MuiSelect-select))': {
              backgroundColor: figVars['bg-max'],
              boxShadow: figSurfaceShadow(),
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            },
            // Select trigger = the outlined-button surface (secondaryPillStyle): a bg-1/bg-4 fill
            // wrapped by the shared ring (figSurfaceShadow), same 0.5rem radius (from `root`).
            // The notched border is dropped — the ring IS the outline — so there's no blueish or
            // animated border; hover & open step the fill (same as the button) while the ring
            // stays put.
            '&:has(.MuiSelect-select)': {
              backgroundColor: figVars['bg-1'],
              boxShadow: figSurfaceShadow(),
              // Animate the hover/open fill+ring step (was instant — the root had no transition).
              transition: theme.transitions.create(['background-color', 'box-shadow'], {
                duration: motion.duration.hover,
              }),
              ...darkScheme({ backgroundColor: figVars['bg-4'] }),
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              // Open fill is keyed to the Select's actual open state (`aria-expanded` on the
              // select), NOT `.Mui-focused`: a Select keeps focus after its menu closes, so a
              // focus-based fill would linger after closing and while other fields are focused.
              '&:hover, &:has(.MuiSelect-select[aria-expanded="true"])': {
                backgroundColor: figVars['bg-4'],
                boxShadow: figSurfaceShadow(),
                ...darkScheme({ backgroundColor: figVars['bg-5'] }),
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              },
              // Keyboard-focus ring only (browser deems focus visible → keyboard nav, not the
              // focus MUI restores to the trigger on close). Matches the outlined-button ring.
              '&:has(.MuiSelect-select:focus-visible)': {
                outline: `2px solid ${figVars['fg-1']}`,
                outlineOffset: '3px',
              },
              // Disabled dropdown: inert to hover / pointer / touch (no hover fill step, no
              // pointer cursor). The faded look still comes from MUI's `.Mui-disabled` text.
              '&.Mui-disabled': {
                pointerEvents: 'none',
              },
            },
          },
        },
      },
      MuiButtonBase: {
        defaultProps: {
          // No ripple / pressed "splash" on any control (menu items, buttons, icon
          // buttons, toggles, checkboxes, tabs, …). Interaction is conveyed by hover,
          // keyboard focus, and the press-scale — not MUI's ripple. Set on ButtonBase so
          // it covers every ButtonBase-derived component in one place.
          disableRipple: true,
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            // Size to content + padding, not MUI's default 64px floor (which let buttons in tight
            // flex rows squish below their content). Row action buttons re-add an even floor
            // locally (ListButtonsColumn); deliberate collapses keep their own minWidth: 0.
            minWidth: 'unset',
            // Never wrap the label to a second line — buttons size to their text and stay one line
            // even in tight flex rows (e.g. the sGHO markets banner's action row).
            whiteSpace: 'nowrap',
            // Hover/focus state transition at 100ms (overrides MUI's 250ms default).
            // `transform` is included so the active-press scale animates in and out.
            transition: theme.transitions.create(
              ['background-color', 'box-shadow', 'border-color', 'color', 'transform'],
              { duration: motion.duration.hover }
            ),
            // Subtle press feedback — scale down while active (not when disabled).
            ...pressScaleActive,
            // Keyboard-focus ring in the variant's own text color; ButtonBase zeroes the
            // native outline, so we set our own (2px, offset 3px out).
            '&.Mui-focusVisible': {
              outline: '2px solid currentColor',
              outlineOffset: '3px',
            },
          },
          sizeLarge: {
            ...theme.typography.buttonL,
            height: '48px',
            padding: '0 24px',
            borderRadius: '0.625rem',
          },
          sizeMedium: {
            ...theme.typography.buttonM,
            height: '36px',
            // Text-side padding; a start/end icon's -4px slot margin (MUI default) tightens
            // the icon side to ~10px automatically.
            padding: '0 0.88rem',
            borderRadius: '0.5rem',
          },
          sizeSmall: {
            ...theme.typography.buttonS,
            height: '28px',
            padding: '0 6px',
            borderRadius: '0.375rem',
          },
        },
        variants: [
          // Secondary "white pill": a hairline ring instead of a border, with a bg-4 fill
          // in dark mode.
          {
            props: { color: 'primary', variant: 'outlined' },
            style: {
              ...secondaryPillStyle,
              '&.Mui-disabled': {
                color: figVars['fg-3'],
                border: 'none',
                boxShadow: figSurfaceShadow(),
              },
            },
          },
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              backgroundColor: figVars['fg-max'],
              // Same lift as the outlined pill, but ringed in the button's own fill (not
              // shadow-stroke-2) — the opaque bg already reads as a boundary, so the ring just
              // needs to disappear into it while the drop-shadow layer still adds the lift.
              boxShadow: figSurfaceShadow('fg-max'),
              '&:hover, &.Mui-focusVisible': {
                // One per-scheme token (fg-max-hover: fg-1 ink in light, bone off-white in dark)
                // instead of an fg-1↔bone swap via the dark selector — the hover follows the
                // NEAREST color scheme (the dev showcase's local toggle), not the global <html>.
                backgroundColor: figVars['fg-max-hover'],
                boxShadow: figSurfaceShadow('fg-max-hover'),
              },
              // The root focus ring uses `currentColor`, which here is contrastText (bg-1) —
              // nearly the same shade as the page background, so it's invisible. Re-point it at
              // fg-1 (same ink the outlined variant's ring uses) so it reads against the page.
              '&.Mui-focusVisible': {
                outlineColor: figVars['fg-1'],
              },
              // Disabled: crisp label, fg-max fill at 50% (no box-shadow on contained).
              '&.Mui-disabled': disabledFade({
                color: figVars['bg-1'],
                before: { backgroundColor: figVars['fg-max'] },
              }),
            },
          },
        ],
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: theme.transitions.create(['background-color', 'color', 'transform'], {
              duration: motion.duration.hover,
            }),
            // Subtle press feedback — scale down while active (not when disabled).
            ...pressScaleActive,
            // Keep the hover fill while the menu this button opens is expanded (open === hover).
            // MUI's IconButton hover is `action.hover` (= button-hover), so match it.
            '&[aria-expanded="true"]': {
              backgroundColor: figVars['button-hover'],
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            transition: theme.transitions.create(['background-color', 'color', 'transform'], {
              duration: motion.duration.hover,
            }),
            // Subtle press feedback — scale down while active (not when disabled).
            ...pressScaleActive,
          },
        },
      },
      MuiCheckbox: {
        defaultProps: {
          icon: <Box sx={selectionControlResting} />,
          checkedIcon: (
            <Box sx={selectionControlChecked}>
              <SvgIcon sx={{ fontSize: 12, color: onAccent }} viewBox="0 0 12 12">
                <path
                  d="M2.5 6.5L5 9L9.5 3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </SvgIcon>
            </Box>
          ),
        },
        styleOverrides: selectionControlRootReset,
      },
      MuiRadio: {
        defaultProps: {
          // Circular twin of the custom checkbox — shares its recipe, overriding the shape.
          icon: <Box sx={{ ...selectionControlResting, borderRadius: '50%' }} />,
          checkedIcon: (
            <Box sx={{ ...selectionControlChecked, borderRadius: '50%' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: onAccent }} />
            </Box>
          ),
        },
        styleOverrides: selectionControlRootReset,
      },
      MuiTypography: {
        defaultProps: {
          variant: 'description',
          variantMapping: {
            display1: 'h1',
            h1: 'h1',
            h2: 'h2',
            h3: 'h3',
            h4: 'h4',
            h5: 'p',
            subheader1: 'p',
            subheader2: 'p',
            caption: 'p',
            description: 'p',
            buttonL: 'p',
            buttonM: 'p',
            buttonS: 'p',
            main12: 'p',
            secondary16: 'p',
            secondary21: 'p',
            helperText: 'span',
          },
        },
      },
      MuiLink: {
        defaultProps: {
          variant: 'description',
        },
      },
      MuiMenu: {
        defaultProps: {
          // Menu hard-defaults transitionDuration='auto' and forwards it explicitly,
          // shadowing the MuiPopover default below — so menus/selects need the duration
          // set here too. TransitionComponent is set explicitly as well (rather than
          // relying on the inner Popover's own default) to keep the theme authoritative.
          TransitionComponent: ScaleFade,
          transitionDuration: motion.duration.overlay,
          PaperProps: {
            variant: 'outlined',
            style: {
              minWidth: 240,
            },
          },
        },
        styleOverrides: {
          // Own the dropdown paper's look HERE (not only via PaperProps) so it survives
          // components that inject their own paper slotProps and drop the theme's PaperProps —
          // most notably Select, whose menu would otherwise lose the 8px offset + outlined
          // surface and look nothing like our other dropdowns. `&&` outweighs the MuiPaper
          // variant styles. With the 0.38rem list inset + 2rem rows (MuiMenuItem), every
          // dropdown (Selects included) matches the settings menu.
          paper: {
            '&&': {
              marginTop: '8px',
              borderRadius: MENU_PAPER_RADIUS,
              border: 'none',
              boxShadow: figSurfaceShadow(),
              backgroundColor: figVars['surface-elevated'],
            },
            // Dark surface at the SAME doubled specificity as the light fill above, so it wins
            // in dark mode. (The darkScheme helper's single `&` lost to `&&`, which left the
            // light paper — and light-looking options — showing in dark mode.)
            '*:where([data-mui-color-scheme="dark"]) &&': {
              backgroundColor: figVars['bg-2'],
            },
            '.MuiList-root': { padding: MENU_LIST_INSET },
          },
        },
      },
      MuiPopover: {
        // Covers raw Popover usages (MarketSwitcher desktop, multiselects, swap inputs).
        defaultProps: {
          TransitionComponent: ScaleFade,
          transitionDuration: motion.duration.overlay,
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            '.MuiDivider-root': {
              marginTop: '8px',
              marginBottom: '4px',
            },
          },
          padding: {
            paddingTop: '4px',
            paddingBottom: '4px',
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            minHeight: '2rem',
            // MUI relaxes MenuItem min-height to `auto` at ≥sm; re-assert 2rem there so
            // every option row is a firm 2rem tall on desktop too.
            [theme.breakpoints.up('sm')]: { minHeight: '2rem' },
            padding: '0.31rem 0.38rem',
            // The hover/selected highlight is a pseudo-element inset 1px top & bottom, so
            // adjacent highlights keep a small gap while the row itself stays full-height — the
            // hover target is continuous, so moving between rows never interrupts the highlight.
            // Shared recipe (geometry + motion) lives in insetHighlight.ts; the radius is kept
            // concentric with the menu paper (paper radius − list inset).
            ...insetHighlightBase({
              theme,
              radius: `calc(${MENU_PAPER_RADIUS} - ${MENU_LIST_INSET})`,
              top: '1px',
              bottom: '1px',
            }),
            // Hover, keyboard focus (arrow-key nav sets .Mui-focusVisible), and the selected row
            // all share one subtle highlight — the button-hover fill, never MUI's primary tint.
            '&:hover::before, &.Mui-focusVisible::before, &.Mui-selected::before':
              insetHighlightActive(figVars['button-hover']),
            // Highlight lives on the pseudo above — keep the row's own background clear.
            // The compound selected states are listed explicitly: MUI's base MenuItem paints
            // `&.Mui-selected:hover` / `&.Mui-selected.Mui-focusVisible` with a primary tint at
            // higher specificity than a lone `&.Mui-selected`, so without these the selected row
            // would show a stronger fill than other rows on hover/keyboard-focus.
            '&:hover, &.Mui-focusVisible, &.Mui-selected, &.Mui-selected:hover, &.Mui-selected.Mui-focusVisible':
              {
                backgroundColor: 'transparent',
              },
          },
        },
      },
      MuiListItemText: {
        styleOverrides: {
          root: {
            ...theme.typography.subheader2,
            fontSize: pxToRem(14),
            fontWeight: 400,
            lineHeight: pxToRem(14),
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: theme.vars.palette.primary.light,
            minWidth: 'unset !important',
            marginRight: '12px',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            marginTop: 0,
            marginBottom: 0,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
          },
        },
        variants: [
          {
            props: { variant: 'outlined' },
            style: {
              border: 'none',
              boxShadow: figSurfaceShadow(),
              background: figVars['surface-elevated'],
              ...darkScheme({
                background: figVars['bg-2'],
              }),
            },
          },
          {
            props: { variant: 'elevation' },
            style: {
              boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
              ...darkScheme({ backgroundImage: 'none' }),
            },
          },
          {
            props: { variant: 'modal' },
            style: {
              borderRadius: '0.75rem',
              backgroundColor: figVars['bg-2'],
              boxShadow: `0 0 0 1px ${figVars['border-1']}, 0 4px 16px 0 ${figVars['shadow-medium']}`,
            },
          },
          {
            // Canonical list/content card surface — the single source of truth for ListWrapper and
            // the module cards (reserve-overview, staking, sGho, …). surface-elevated fill, 10px
            // radius, the shared surface ring (shadow-stroke-1 hairline + soft drop).
            props: { variant: 'card' },
            style: {
              backgroundColor: figVars['surface-elevated'],
              borderRadius: '10px',
              boxShadow: figSurfaceShadow('shadow-stroke-1'),
            },
          },
        ],
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            paddingBottom: '39px',
            paddingLeft: '8px',
            paddingRight: '8px',
            [theme.breakpoints.up('xsm')]: {
              paddingLeft: '20px',
              paddingRight: '20px',
            },
            [theme.breakpoints.up('sm')]: {
              paddingLeft: '48px',
              paddingRight: '48px',
            },
            [theme.breakpoints.up('md')]: {
              paddingLeft: '96px',
              paddingRight: '96px',
            },
            [theme.breakpoints.up('lg')]: {
              paddingLeft: '20px',
              paddingRight: '20px',
              maxWidth: '1280px',
            },
            [theme.breakpoints.up('xl')]: {
              paddingLeft: '96px',
              paddingRight: '96px',
            },
            [theme.breakpoints.up('xxl')]: {
              paddingLeft: 0,
              paddingRight: 0,
              maxWidth: '1440px',
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: '1.75rem',
            height: '1.125rem',
            padding: 0,
            flexShrink: 0,
            borderRadius: '9px',
            // Keyboard-focus ring (see `focusRing`). The focus class lands on the inner
            // switchBase, so key the root's ring off it.
            '&:has(.Mui-focusVisible)': focusRing,
          },
          switchBase: {
            padding: 0,
            margin: '2px',
            '&.Mui-checked': {
              transform: 'translateX(10px)',
              '& + .MuiSwitch-track': {
                backgroundColor: figVars['purple-1'],
                opacity: 1,
              },
            },
            '&.Mui-disabled': {
              opacity: 0.7,
              ...darkScheme({ opacity: 0.3 }),
            },
          },
          thumb: {
            color: onAccent,
            borderRadius: '50%',
            width: '14px',
            height: '14px',
            boxShadow: controlThumbShadow,
          },
          track: {
            opacity: 1,
            backgroundColor: figVars['fg-3'],
            borderRadius: '9px',
          },
        },
      },
      MuiFormControlLabel: {
        styleOverrides: {
          root: {
            // A Switch has no internal padding, so MUI's default -11px label offset (meant for
            // padded checkboxes/radios) crams the switch against whatever precedes it in a row.
            // Zero it for switch-labeled controls, and give the switch↔label text a 0.5rem gap.
            // Checkbox/radio labels keep MUI's defaults.
            '&:has(.MuiSwitch-root)': {
              marginLeft: 0,
              '& .MuiFormControlLabel-label': {
                marginLeft: '0.5rem',
              },
            },
          },
        },
      },
      MuiIcon: {
        variants: [
          {
            props: { fontSize: 'large' },
            style: {
              fontSize: pxToRem(32),
            },
          },
        ],
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: figVars['border-2'],
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            ...theme.typography.caption,
            alignItems: 'flex-start',
            '.MuiAlert-message': {
              padding: 0,
              paddingTop: '2px',
              paddingBottom: '2px',
            },
            '.MuiAlert-icon': {
              padding: 0,
              opacity: 1,
              '.MuiSvgIcon-root': {
                fontSize: pxToRem(20),
              },
            },
            a: {
              ...theme.typography.caption,
              fontWeight: 500,
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none',
              },
            },
            '.MuiButton-text': {
              ...theme.typography.caption,
              fontWeight: 500,
              textDecoration: 'underline',
              padding: 0,
              margin: 0,
              minWidth: 'unset',
              '&:hover': {
                textDecoration: 'none',
                background: 'transparent',
              },
            },
          },
        },
        defaultProps: {
          iconMapping: {
            error: (
              <SvgIcon color="error">
                <ExclamationIcon />
              </SvgIcon>
            ),
            info: (
              <SvgIcon color="info">
                <InformationCircleIcon />
              </SvgIcon>
            ),
            success: (
              <SvgIcon color="success">
                <CheckCircleIcon />
              </SvgIcon>
            ),
            warning: (
              <SvgIcon color="warning">
                <ExclamationCircleIcon />
              </SvgIcon>
            ),
          },
        },
        variants: [
          {
            props: { severity: 'error' },
            style: {
              color: theme.vars.palette.error['100'],
              background: theme.vars.palette.error['200'],
              a: {
                color: theme.vars.palette.error['100'],
              },
              '.MuiButton-text': {
                color: theme.vars.palette.error['100'],
              },
            },
          },
          {
            props: { severity: 'info' },
            style: {
              color: theme.vars.palette.info['100'],
              background: theme.vars.palette.info['200'],
              a: {
                color: theme.vars.palette.info['100'],
              },
              '.MuiButton-text': {
                color: theme.vars.palette.info['100'],
              },
            },
          },
          {
            props: { severity: 'success' },
            style: {
              color: theme.vars.palette.success['100'],
              background: theme.vars.palette.success['200'],
              a: {
                color: theme.vars.palette.success['100'],
              },
              '.MuiButton-text': {
                color: theme.vars.palette.success['100'],
              },
            },
          },
          {
            props: { severity: 'warning' },
            style: {
              color: theme.vars.palette.warning['100'],
              background: theme.vars.palette.warning['200'],
              a: {
                color: theme.vars.palette.warning['100'],
              },
              '.MuiButton-text': {
                color: theme.vars.palette.warning['100'],
              },
            },
          },
        ],
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: pxToRem(14),
            minWidth: '375px',
            backgroundColor: figVars['bg-2'],
            '> div:first-of-type': {
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            },
          },
          // Respect the OS "reduce motion" preference app-wide (incl. the dev showcase,
          // since CssBaseline is injected once at the app root).
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          colorPrimary: {
            color: theme.vars.palette.primary.light,
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          IconComponent: (props) => (
            <ChevronUpDownIcon {...props} sx={{ fontSize: '18px', color: figVars['fg-3'] }} />
          ),
        },
        styleOverrides: {
          outlined: {
            // The trigger's fill + ring live on the OutlinedInput root (see MuiOutlinedInput)
            // so they're rounded and wrapped like the outlined button; here just the text.
            ...theme.typography.buttonM,
            color: figVars['fg-1'],
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          bar1Indeterminate: {
            background: figVars['purple-1'],
          },
          bar2Indeterminate: {
            background: figVars['purple-1'],
          },
        },
      },
    },
  } as ThemeOptions;
}

/**
 * Assemble the full app MUI theme (CSS-variables mode): both color schemes' design tokens
 * plus the component overrides. Single source of truth shared by the app root
 * (`AppGlobalStyles`) and the dev component showcase, so they can't drift apart. Color
 * scheme is switched via the `data-mui-color-scheme` attribute, not by rebuilding the theme.
 */
export const createAppTheme = () => {
  const light = getDesignTokens('light');
  const dark = getDesignTokens('dark');
  const shared = {
    breakpoints: light.breakpoints,
    spacing: light.spacing,
    typography: light.typography,
    colorSchemes: {
      light: { palette: light.palette },
      dark: { palette: dark.palette },
    },
  };
  // Build a base theme first so `getThemedComponents` can read its `.vars` (CSS-var refs),
  // then rebuild with those overrides attached. (A build-once `theme.components = …` mutation
  // trips MUI's `Components<Theme>` typing, so the two-pass is the type-clean form.)
  const base = experimental_extendTheme(shared);
  return experimental_extendTheme({
    ...shared,
    components: getThemedComponents(base).components,
  });
};

// --- Display-P3 override layer -------------------------------------------------------------

const isColorValue = (v: string) => v.startsWith('#') || v.startsWith('rgb');

// Walk a color scheme's palette and, for every solid color leaf, emit a P3 override keyed to
// the CSS variable MUI generates for it (`--mui-palette-<path joined by '-'>`). Non-color
// leaves (numbers, `mode`, channel strings like "32 29 29", gradients) are skipped.
const collectP3Vars = (
  node: Record<string, unknown>,
  path: string[],
  out: Record<string, string>
) => {
  Object.entries(node).forEach(([key, value]) => {
    if (typeof value === 'string' && isColorValue(value)) {
      out[`--mui-palette-${[...path, key].join('-')}`] = colorToP3(value);
    } else if (value && typeof value === 'object') {
      collectP3Vars(value as Record<string, unknown>, [...path, key], out);
    }
  });
};

/**
 * Build Display-P3 overrides for the generated `--mui-palette-*` CSS variables — one entry
 * per solid color token, per color scheme. Injected under `@supports (color-gamut: p3)` so
 * wide-gamut displays get the richer color while everything else keeps the sRGB base var.
 * (Alpha-composited tints via MUI's `rgba(<channel> / a)` stay sRGB — see migration notes.)
 */
export const buildP3Overrides = (theme: AppTheme) => {
  const forScheme = (scheme?: { palette?: unknown }) => {
    const out: Record<string, string> = {};
    collectP3Vars((scheme?.palette ?? {}) as Record<string, unknown>, [], out);
    return out;
  };
  return {
    light: forScheme(theme.colorSchemes.light),
    dark: forScheme(theme.colorSchemes.dark),
  };
};
