import { type ThemeOptions, darkTheme, lightTheme } from '@funkit/connect';
import { alpha } from '@mui/material';
import { type FigmaColorName, pickFigma } from 'src/utils/figmaColors';
import { FONT } from 'src/utils/theme';

/**
 * Aave funkit theme, mapped onto the interface's own design tokens so the checkout reads as part
 * of the app rather than the fun team's stock customer theme. Colours resolve from
 * `figmaLight`/`figmaDark` as concrete per-scheme values — funkit builds its theme outside React
 * and swaps schemes itself (see FunkitCheckout's `toggleTheme`), so it can't take CSS vars.
 */
const customFontSizings: ThemeOptions['customFontSizings'] = {
  '10': { fontSize: '10px', lineHeight: '12px' },
  '12': { fontSize: '12px', lineHeight: '16px' },
  '13': { fontSize: '13px', lineHeight: '18px' },
  '14': { fontSize: '14px', lineHeight: '20px' },
  '16': { fontSize: '16px', lineHeight: '24px' },
  '18': { fontSize: '18px', lineHeight: '22px' },
  '20': { fontSize: '20px', lineHeight: '24px' },
  '21': { fontSize: '21px', lineHeight: '28px' },
  '40': { fontSize: '40px', lineHeight: '48px' },
  '57': { fontSize: '57px', lineHeight: '68px' },
  modalTopbarTitle: { fontSize: '16px', lineHeight: '24px' },
  modalTopbarSubtitle: { fontSize: '12px', lineHeight: '16px' },
  modalBottomBarButtonText: { fontSize: '14px', lineHeight: '20px' },
};

const customBorderRadiuses = {
  modal: '0.75rem',
  modalMobile: '0.75rem',
  modalActionButton: '0.5rem',
  modalActionButtonMobile: '0.5rem',
  connectButton: '0.5rem',
  qrCode: '0.5rem',
  tooltip: '0.5rem',
  skeleton: '0.5rem',
  actionButton: '0.5rem',
  actionButtonInner: '0.375rem',
  menuButton: '0.5rem',
  summaryBox: '0.75rem',
  dropdownItem: '0.5rem',
  youPayYouReceive: '50px',
  inputAmountSwitcher: '0.5rem',
  dropdown: '0.75rem',
};

// The app's contained button hovers by compositing a translucent `button-hover-primary` overlay
// over its fg-1 fill; funkit takes a flat colour, so these are that overlay already composited.
const primaryFillHover = { light: '#292929', dark: '#d6d6d6' };

// Soft green-yellow gradient composited as a translucent overlay on top of
// the modal background during the post-checkout success state. Values
// lifted from Figma node 10852:39855 (Customer-Themes file); the solid
// white base layer from the Figma export is intentionally omitted so the
// theme's modalBackground (white in light, dark in dark) shows through.
const aaveCheckoutCompleteGradient = [
  'linear-gradient(71.67deg, rgba(225,253,16,0) 74.39%, rgba(194,204,0,0.1) 98.07%)',
  'linear-gradient(-23.68deg, rgba(0,204,112,0) 72.26%, rgba(0,204,88,0.1) 88.40%)',
  'linear-gradient(-7.43deg, rgba(102,204,0,0) 57.00%, rgba(102,204,0,0.1) 97.77%)',
].join(', ');

const customDimensions = {
  modalBottomBarButtonHeight: '44px',
  modalTopBarHeight: '72px',
};

const customSpacings = {
  cryptoCashToggleTabPaddingY: '12px',
  modalTopBarVerticalTextSpacing: '6px',
};

/** The seven values that genuinely differ between the two schemes. */
type SchemeOverrides = {
  modalBackground: FigmaColorName;
  tertiaryFill: FigmaColorName;
  tertiaryFillHover: FigmaColorName;
  tertiaryFillDisabled: FigmaColorName;
  activeTab: FigmaColorName;
  cryptoCashToggle: FigmaColorName;
  primaryFillHover: string;
};

const buildColors = (mode: 'light' | 'dark', o: SchemeOverrides) => {
  const t = pickFigma(mode);
  const stroke = t['border-1'];
  const offBackground = t['bg-3'];
  const secondaryBackground = t['bg-4'];

  return {
    primaryText: t['fg-1'],
    secondaryText: t['fg-2'],
    tertiaryText: t['fg-3'],
    lightStroke: t['border-0'],
    mediumStroke: stroke,
    heavyStroke: t['border-2'],
    modalBackground: t[o.modalBackground],
    actionColor: t['fg-1'],
    offBackground,
    offBackgroundInverse: t['fg-2'],
    secondaryBackground,

    modalBackdrop: 'rgba(0, 0, 0, 0.32)',
    modalBackgroundCheckoutComplete: aaveCheckoutCompleteGradient,
    modalHeaderDivider: stroke,
    modalFooterDivider: stroke,
    modalBorder: stroke,

    buttonTextPrimary: t['bg-1'],
    buttonTextHover: t['bg-1'],
    buttonTextDisabled: t['bg-1'],

    buttonBackground: t['fg-1'],
    buttonBackgroundHover: o.primaryFillHover,
    buttonBackgroundPressed: o.primaryFillHover,
    buttonBackgroundDisabled: alpha(t['fg-1'], 0.5),

    buttonTextTertiary: t['fg-1'],
    buttonTextDisabledTertiary: t['fg-3'],
    buttonBackgroundTertiary: t[o.tertiaryFill],
    buttonBackgroundHoverTertiary: t[o.tertiaryFillHover],
    buttonBackgroundDisabledTertiary: t[o.tertiaryFillDisabled],

    youPayYouReceiveBorder: stroke,
    youPayYouReceiveBackground: t[o.modalBackground],
    inputAmountQuickOptionBaseBackground: offBackground,
    inputAmountQuickOptionHoverBackground: secondaryBackground,
    focusedOptionBorder: t['fg-1'],
    modalTopbarIcon: t['fg-2'],
    modalTopbarIconBackgroundHover: secondaryBackground,
    modalTopbarIconBackgroundPressed: secondaryBackground,
    buttonIconBackgroundHover: secondaryBackground,
    buttonBorderFocusedTertiary: stroke,
    menuItemBackground: offBackground,
    copyButtonBackgroundHover: secondaryBackground,
    copyButtonBackgroundActive: secondaryBackground,
    funFeatureListBackgroundHover: secondaryBackground,
    activeTabBackground: t[o.activeTab],
    activeTabBorderColor: stroke,
    cryptoCashToggleBackground: t[o.cryptoCashToggle],
    generalBorder: stroke,
    inputBorderHover: offBackground,
  };
};

const darkThemeObject = darkTheme({
  customFontFamily: FONT,
  customColors: buildColors('dark', {
    modalBackground: 'bg-2',
    tertiaryFill: 'bg-4',
    tertiaryFillHover: 'bg-5',
    tertiaryFillDisabled: 'bg-3',
    activeTab: 'bg-4',
    cryptoCashToggle: 'bg-3',
    primaryFillHover: primaryFillHover.dark,
  }),
  customFontSizings,
  customBorderRadiuses,
  customDimensions,
  customSpacings,
  overlayBlur: 'none',
});

const lightThemeObject = lightTheme({
  customFontFamily: FONT,
  customColors: buildColors('light', {
    modalBackground: 'bg-1',
    tertiaryFill: 'bg-3',
    tertiaryFillHover: 'bg-4',
    tertiaryFillDisabled: 'bg-2',
    activeTab: 'bg-3',
    cryptoCashToggle: 'bg-4',
    primaryFillHover: primaryFillHover.light,
  }),
  customFontSizings,
  customBorderRadiuses,
  customShadows: {
    dialog: `0 0 0 1px ${pickFigma('light')['border-1']}, 0 4px 16px 0 ${
      pickFigma('light')['shadow-medium']
    }`,
  },
  customDimensions,
  customSpacings,
  overlayBlur: 'none',
});

export const aaveTheme = {
  darkTheme: darkThemeObject,
  lightTheme: lightThemeObject,
};
