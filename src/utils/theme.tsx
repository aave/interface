import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline';
import { Box, SvgIcon, ThemeOptions } from '@mui/material';
import { createTheme, experimental_extendTheme } from '@mui/material/styles';
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

/**
 * Secondary "white pill" style for the `outlined` button variant: a hairline ring instead
 * of a border (bg-1 in light, bg-4 in dark) with a subtle fill shift on hover. On hover the
 * ring is re-asserted (the global `disableElevation` default otherwise strips box-shadow),
 * and `border` is forced to none to suppress MUI's default outlined hover border.
 */
const secondaryPillStyle = {
  color: figVars['fg-1'],
  // Different token per mode: white pill (bg-1) in light, a bg-4 fill in dark.
  backgroundColor: figVars['bg-1'],
  border: 'none',
  boxShadow: figSurfaceShadow(),
  '& .MuiButton-startIcon': {
    color: figVars['fg-3'],
  },
  ...darkScheme({
    backgroundColor: figVars['bg-4'],
  }),
  '&:hover, &.Mui-focusVisible': {
    backgroundColor: figVars['bg-4'],
    // Suppress MUI's default outlined hover border (its `:hover` rule would otherwise
    // re-introduce a 1px border on top of the borderless pill).
    border: 'none',
    boxShadow: figSurfaceShadow(),
    ...darkScheme({
      backgroundColor: figVars['bg-5'],
    }),
  },
};

// Shared box geometry for the custom checkbox icon (unchecked + checked).
const checkboxIconBox = { width: 18, height: 18, borderRadius: '0.375rem' };

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
  tooltip: React.CSSProperties;
  main21: React.CSSProperties;
  secondary21: React.CSSProperties;
  main16: React.CSSProperties;
  secondary16: React.CSSProperties;
  main14: React.CSSProperties;
  secondary14: React.CSSProperties;
  main12: React.CSSProperties;
  secondary12: React.CSSProperties;
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
    tooltip: true;
    main21: true;
    secondary21: true;
    main16: true;
    secondary16: true;
    main14: true;
    secondary14: true;
    main12: true;
    secondary12: true;
    h5: false;
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
      h5: undefined,
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
        fontWeight: 600,
        letterSpacing: 'unset',
        lineHeight: '133.4%',
        fontSize: pxToRem(21),
      },
      h3: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: '160%',
        fontSize: pxToRem(18),
      },
      h4: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
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
      tooltip: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
      main21: {
        fontFamily: FONT,
        fontWeight: 800,
        lineHeight: '133.4%',
        fontSize: pxToRem(21),
      },
      secondary21: {
        fontFamily: FONT,
        fontWeight: 500,
        lineHeight: '133.4%',
        fontSize: pxToRem(21),
      },
      main16: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
      },
      secondary16: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        fontSize: pxToRem(16),
      },
      main14: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(20),
        fontSize: pxToRem(14),
      },
      secondary14: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(20),
        fontSize: pxToRem(14),
      },
      main12: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(16),
        fontSize: pxToRem(12),
      },
      secondary12: {
        fontFamily: FONT,
        fontWeight: 500,
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
            borderRadius: '8px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: figVars['input-border-hover'],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: figVars['input-border-hover'],
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            '& .MuiSlider-thumb': {
              color: figVars['slider-thumb'],
            },
            '& .MuiSlider-track': {
              color: figVars['slider-track'],
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
          // No ripple / pressed splash on mouse-down (hover + keyboard focus are the
          // only interaction states).
          disableRipple: true,
        },
        styleOverrides: {
          root: {
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
              '&:hover, &.Mui-focusVisible': {
                backgroundColor: figVars['fg-1'],
                // Dark: fg-1 equals fg-max (#fff) so the swap is invisible — use bone instead.
                ...darkScheme({
                  backgroundColor: figVars['bone'],
                }),
              },
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
          disableRipple: true,
          icon: (
            <Box
              sx={{
                ...checkboxIconBox,
                border: `1px solid ${figVars['border-0']}`,
                backgroundColor: figVars['bg-max'],
                boxSizing: 'border-box',
                '.MuiCheckbox-root:hover &': {
                  backgroundColor: figVars['bg-4'],
                },
              }}
            />
          ),
          checkedIcon: (
            <Box
              sx={{
                ...checkboxIconBox,
                backgroundColor: figVars['purple-1'],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
        styleOverrides: {
          root: {
            '&:hover, &.Mui-focusVisible': {
              backgroundColor: 'transparent',
            },
          },
        },
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
            subheader1: 'p',
            subheader2: 'p',
            caption: 'p',
            description: 'p',
            buttonL: 'p',
            buttonM: 'p',
            buttonS: 'p',
            main12: 'p',
            main14: 'p',
            main16: 'p',
            main21: 'p',
            secondary12: 'p',
            secondary14: 'p',
            secondary16: 'p',
            secondary21: 'p',
            helperText: 'span',
            tooltip: 'span',
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
              marginTop: '4px',
            },
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
              marginTop: '4px',
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
            padding: '12px 16px',
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
            boxShadow: '0px 1px 1px rgba(0, 0, 0, 0.12)',
          },
          track: {
            opacity: 1,
            backgroundColor: figVars['fg-3'],
            borderRadius: '9px',
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
            backgroundColor: figVars['bg-1'],
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
