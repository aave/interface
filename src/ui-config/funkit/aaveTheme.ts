import { type ThemeOptions, darkTheme, lightTheme } from '@funkit/connect';

/**
 * Aave funkit theme, ported *almost* verbatim from the funkit playground's customer theme
 * (`funkit:apps/with-next/themes/aave.ts`) — the Figma-derived theme the fun team
 * maintains for Aave (Customer-Themes file).
 */

// The canonical aave theme (sizings included) was designed and QA'd against the
// with-next playground's body font — a system-first stack that renders SF Pro on
// macOS. The interface's body font is Inter, whose taller metrics make the same
// sizings look heavier/cramped (and clip in tight line-heights), so instead of
// `customFontFamily: 'inherit'` we pin the modal to the playground's exact stack
// to match the reference rendering pixel-for-pixel. If design wants the modal in
// Inter (the app font), the sizings below need an Inter-specific re-tune first.
const customFontFamily =
  "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', 'Roboto', sans-serif";

const customFontSizings: ThemeOptions['customFontSizings'] = {
  // Bump fontSize by 1px, keep lineHeight
  '10': { fontSize: '11px', lineHeight: '16px' },
  '12': { fontSize: '13px', lineHeight: '15px' },
  '13': { fontSize: '14px', lineHeight: '19px' },
  '14': { fontSize: '15px', lineHeight: '19px' },
  '16': { fontSize: '17px', lineHeight: '21px' },
  '18': { fontSize: '19px', lineHeight: '25px' },
  '20': { fontSize: '21px', lineHeight: '21px' },
  '21': { fontSize: '22px', lineHeight: '22px' },
  '40': { fontSize: '41px', lineHeight: '49px' },
  '57': { fontSize: '58px', lineHeight: '69px' },
  modalTopbarTitle: { fontSize: '21px', lineHeight: '24px' },
  modalTopbarSubtitle: { fontSize: '12px', lineHeight: '19px' },
  modalBottomBarButtonText: { fontSize: '13px', lineHeight: '16px' },
};

const customBorderRadiuses = {
  modal: '4px',
  modalMobile: '4px',
  modalActionButton: '4px',
  modalActionButtonMobile: '4px',
  connectButton: '4px',
  qrCode: '4px',
  tooltip: '4px',
  skeleton: '4px',
  actionButton: '4px',
  actionButtonInner: '3px',
  menuButton: '4px',
  summaryBox: '4px',
  dropdownItem: '4px',
  youPayYouReceive: '50px',
  inputAmountSwitcher: '4px',
  dropdown: '4px',
};

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

const darkThemeColors = {
  primaryText: '#F1F1F3',
  secondaryText: '#A5A8B5',
  tertiaryText: '#A5A8B5',
  lightStroke: '#393C4D',
  mediumStroke: '#393C4D',
  heavyStroke: '#414558',
  modalBackground: '#2A2E40',
  actionColor: '#FFFFFF',
  offBackground: '#393D4F',
  offBackgroundInverse: '#A5A8B5',
  secondaryBackground: '#42475C',
};

const darkThemeObject = darkTheme({
  customFontFamily,
  customColors: {
    ...darkThemeColors,
    modalBackdrop: 'rgba(0, 0, 0, 0.6)',
    modalBackgroundCheckoutComplete: aaveCheckoutCompleteGradient,
    modalHeaderDivider: darkThemeColors.mediumStroke,
    modalFooterDivider: darkThemeColors.mediumStroke,
    modalBorder: darkThemeColors.lightStroke,

    buttonTextPrimary: '#2A2E40',
    buttonTextHover: '#2A2E40',
    buttonTextDisabled: 'rgba(42, 46, 64, 0.9)',

    buttonBackground: darkThemeColors.actionColor,
    buttonBackgroundHover: '#D2D4DB',
    buttonBackgroundPressed: '#D2D4DB',
    buttonBackgroundDisabled: 'rgba(255, 255, 255, 0.5)',

    buttonTextTertiary: '#F1F1F3',
    buttonTextDisabledTertiary: 'rgba(241, 241, 243, 0.5)',
    buttonBackgroundTertiary: darkThemeColors.offBackground,
    buttonBackgroundHoverTertiary: darkThemeColors.secondaryBackground,
    buttonBackgroundDisabledTertiary: 'rgba(57, 61, 79, 0.5)',

    youPayYouReceiveBorder: darkThemeColors.mediumStroke,
    youPayYouReceiveBackground: darkThemeColors.modalBackground,
    inputAmountQuickOptionBaseBackground: darkThemeColors.offBackground,
    inputAmountQuickOptionHoverBackground: darkThemeColors.secondaryBackground,
    focusedOptionBorder: darkThemeColors.actionColor,
    modalTopbarIcon: darkThemeColors.secondaryText,
    modalTopbarIconBackgroundHover: darkThemeColors.secondaryBackground,
    modalTopbarIconBackgroundPressed: darkThemeColors.secondaryBackground,
    buttonIconBackgroundHover: darkThemeColors.secondaryBackground,
    buttonBorderFocusedTertiary: darkThemeColors.mediumStroke,
    menuItemBackground: darkThemeColors.offBackground,
    copyButtonBackgroundHover: darkThemeColors.secondaryBackground,
    copyButtonBackgroundActive: darkThemeColors.secondaryBackground,
    funFeatureListBackgroundHover: darkThemeColors.secondaryBackground,
    activeTabBackground: darkThemeColors.secondaryBackground,
    activeTabBorderColor: 'rgba(165, 168, 181, 0.1)',
    cryptoCashToggleBackground: darkThemeColors.offBackground,
    generalBorder: darkThemeColors.mediumStroke,
    inputBorderHover: darkThemeColors.offBackground,
  },
  customFontSizings,
  customBorderRadiuses,
  customDimensions: {
    modalBottomBarButtonHeight: '40px',
    modalTopBarHeight: '76px',
  },
  customSpacings: {
    cryptoCashToggleTabPaddingY: '12px',
    modalTopBarVerticalTextSpacing: '6px',
  },
  overlayBlur: 'none',
});

const lightThemeColors = {
  primaryText: '#313547',
  secondaryText: '#636779',
  tertiaryText: '#636779',
  lightStroke: '#EAEBEF',
  mediumStroke: '#EAEBEF',
  heavyStroke: '#E8E9ED',
  modalBackground: '#FFFFFF',
  actionColor: '#393D4F',
  offBackground: '#F7F7F9',
  offBackgroundInverse: '#393D4F',
  secondaryBackground: '#EAEBEF',
};

const lightThemeObject = lightTheme({
  customFontFamily,
  customColors: {
    ...lightThemeColors,
    modalBackdrop: 'rgba(0, 0, 0, 0.6)',
    modalBackgroundCheckoutComplete: aaveCheckoutCompleteGradient,
    modalHeaderDivider: lightThemeColors.mediumStroke,
    modalFooterDivider: lightThemeColors.mediumStroke,
    modalBorder: '#FFFFFF',

    buttonTextPrimary: '#FFFFFF',
    buttonTextHover: '#FFFFFF',
    buttonTextDisabled: 'rgba(255, 255, 255, 1)',

    buttonBackground: lightThemeColors.actionColor,
    buttonBackgroundHover: '#2A2E40',
    buttonBackgroundPressed: '#2A2E40',
    buttonBackgroundDisabled: 'rgba(57, 61, 79, 0.45)',

    buttonTextTertiary: '#636779',
    buttonTextDisabledTertiary: 'rgba(99, 103, 121, 0.5)',
    buttonBackgroundTertiary: lightThemeColors.offBackground,
    buttonBackgroundHoverTertiary: lightThemeColors.secondaryBackground,
    buttonBackgroundDisabledTertiary: 'rgba(247, 247, 249, 0.5)',

    youPayYouReceiveBorder: lightThemeColors.mediumStroke,
    youPayYouReceiveBackground: lightThemeColors.modalBackground,
    inputAmountQuickOptionBaseBackground: lightThemeColors.offBackground,
    inputAmountQuickOptionHoverBackground: lightThemeColors.secondaryBackground,
    focusedOptionBorder: lightThemeColors.actionColor,
    modalTopbarIcon: lightThemeColors.secondaryText,
    modalTopbarIconBackgroundHover: lightThemeColors.secondaryBackground,
    modalTopbarIconBackgroundPressed: lightThemeColors.secondaryBackground,
    buttonIconBackgroundHover: lightThemeColors.secondaryBackground,
    buttonBorderFocusedTertiary: lightThemeColors.mediumStroke,
    menuItemBackground: lightThemeColors.offBackground,
    copyButtonBackgroundHover: lightThemeColors.secondaryBackground,
    copyButtonBackgroundActive: lightThemeColors.secondaryBackground,
    funFeatureListBackgroundHover: lightThemeColors.secondaryBackground,
    activeTabBackground: lightThemeColors.modalBackground,
    activeTabBorderColor: lightThemeColors.heavyStroke,
    cryptoCashToggleBackground: lightThemeColors.offBackground,
  },
  customFontSizings,
  customBorderRadiuses,
  customShadows: {
    dialog: 'rgba(0, 0, 0, 0.05) 0px 2px 1px, rgba(0, 0, 0, 0.25) 0px 0px 1px;',
  },
  customDimensions: {
    modalBottomBarButtonHeight: '40px',
    modalTopBarHeight: '76px',
  },
  customSpacings: {
    cryptoCashToggleTabPaddingY: '12px',
    modalTopBarVerticalTextSpacing: '6px',
  },
  overlayBlur: 'none',
});

export const aaveTheme = {
  darkTheme: darkThemeObject,
  lightTheme: lightThemeObject,
};
