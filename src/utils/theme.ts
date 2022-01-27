import { Theme, ThemeOptions } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import React from 'react';

const theme = createTheme();
const {
  breakpoints,
  typography: { pxToRem },
} = theme;

const FONT = 'Inter, Arial';

const getFontSize = (mobile: number, normal: number, large: number) => {
  return {
    fontSize: pxToRem(mobile),
    [breakpoints.up('sm')]: {
      fontSize: pxToRem(normal),
    },
    [breakpoints.up('lg')]: {
      fontSize: pxToRem(large),
    },
  };
};

declare module '@mui/material/styles/createPalette' {
  interface TypeBackground {
    default: string;
    paper: string;
    surface: string;
    header: string;
  }

  interface Palette {
    gradients: {
      aaveGradient: string;
    };
  }

  interface PaletteOptions {
    gradients: {
      aaveGradient: string;
    };
  }
}

interface TypographyCustomVariants {
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
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
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

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    surface: true;
    gradient: true;
  }
}

export const getDesignTokens = (mode: 'light' | 'dark') => {
  const getColor = (lightColor: string, darkColor: string) =>
    mode === 'dark' ? darkColor : lightColor;

  return {
    breakpoints: {
      keys: ['xs', 'sm', 'md', 'lg', 'xl'],
      values: { xs: 0, sm: 768, md: 1024, lg: 1728, xl: 1920 },
    },
    palette: {
      mode,
      primary: {
        main: getColor('#00244D', '#FAFBFC'),
        light: getColor('#47617F', '#FBFCFD'),
        dark: getColor('#000E1F', '#F2F3F3'),
      },
      secondary: {
        main: getColor('#FF607B', '#F48FB1'),
        light: getColor('#FF607B', '#F6A5C0'),
        dark: getColor('#B34356', '#AA647B'),
      },
      error: {
        main: getColor('#BC0000B8', '#F44336'),
        light: getColor('#D26666', '#E57373'),
        dark: getColor('#BC0000', '#D32F2F'),
      },
      warning: {
        main: getColor('#F89F1A', '#FFA726'),
        light: getColor('#FFCE00', '#FFB74D'),
        dark: getColor('#C67F15', '#F57C00'),
      },
      info: {
        main: getColor('#0062D2', '#29B6F6'),
        light: getColor('#0062D2', '#4FC3F7'),
        dark: getColor('#002754', '#0288D1'),
      },
      success: {
        main: getColor('#4CAF50', '#66BB6A'),
        light: getColor('#90FF95', '#90FF95'),
        dark: getColor('#318435', '#388E3C'),
      },
      text: {
        primary: getColor('#00244D', '#FFFFFF'),
        secondary: getColor('#47617F', '#FFFFFFB2'),
        disabled: getColor('#00244D61', '#FFFFFF80'),
      },
      background: {
        default: getColor('#FAFBFC', '#090815'),
        paper: getColor('#FFFFFF', '#272631'),
        surface: getColor('#FAFBFC', '#2C2D3F'),
        header: getColor('#000E1F', '#090815'),
      },
      divider: getColor('#E0E5EA', '#FFFFFF1F'),
      action: {
        active: getColor('#00244D8A', '#FFFFFF8F'),
        hover: getColor('#00244D0A', '#FFFFFF14'),
        selected: getColor('#00244D14', '#FFFFFF29'),
        disabled: getColor('#00244D42', '#FFFFFF4D'),
        disabledBackground: getColor('#00244D1F', '#FFFFFF1F'),
        focus: getColor('#00244D1F', '#FFFFFF1F'),
      },
      gradients: {
        aaveGradient: 'linear-gradient(248.86deg, #B6509E 10.51%, #2EBAC6 93.41%);',
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
      h1: {
        fontFamily: FONT,
        fontWeight: 800,
        letterSpacing: pxToRem(0.25),
        lineHeight: '123.5%',
        ...getFontSize(32, 32, 32),
      },
      h2: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: 'unset',
        lineHeight: '133.4%',
        ...getFontSize(21, 21, 21),
      },
      h3: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.15),
        lineHeight: '160%',
        ...getFontSize(18, 18, 18),
      },
      h4: {
        fontFamily: FONT,
        fontWeight: 700,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        ...getFontSize(16, 16, 16),
      },
      subheader1: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(20),
        ...getFontSize(14, 14, 14),
      },
      subheader2: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(16),
        ...getFontSize(12, 12, 12),
      },
      description: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.15),
        lineHeight: '143%',
        ...getFontSize(14, 14, 14),
      },
      caption: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(16),
        ...getFontSize(13, 13, 13),
      },
      buttonL: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.46),
        lineHeight: pxToRem(24),
        textTransform: 'uppercase',
        ...getFontSize(15, 15, 15),
      },
      buttonM: {
        fontFamily: FONT,
        fontWeight: 600,
        lineHeight: pxToRem(24),
        ...getFontSize(14, 14, 14),
      },
      buttonS: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.46),
        lineHeight: pxToRem(20),
        textTransform: 'uppercase',
        ...getFontSize(11, 11, 11),
      },
      helperText: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.4),
        lineHeight: pxToRem(12),
        ...getFontSize(10, 10, 10),
      },
      tooltip: {
        fontFamily: FONT,
        fontWeight: 400,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(16),
        ...getFontSize(12, 12, 12),
      },
      main21: {
        fontFamily: FONT,
        fontWeight: 800,
        lineHeight: '133.4%',
        ...getFontSize(21, 21, 21),
      },
      secondary21: {
        fontFamily: FONT,
        fontWeight: 500,
        lineHeight: '133.4%',
        ...getFontSize(21, 21, 21),
      },
      main16: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        ...getFontSize(16, 16, 16),
      },
      secondary16: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(24),
        ...getFontSize(16, 16, 16),
      },
      main14: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(20),
        ...getFontSize(14, 14, 14),
      },
      secondary14: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.15),
        lineHeight: pxToRem(20),
        ...getFontSize(14, 14, 14),
      },
      main12: {
        fontFamily: FONT,
        fontWeight: 600,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(16),
        ...getFontSize(12, 12, 12),
      },
      secondary12: {
        fontFamily: FONT,
        fontWeight: 500,
        letterSpacing: pxToRem(0.1),
        lineHeight: pxToRem(16),
        ...getFontSize(12, 12, 12),
      },
    },
  } as ThemeOptions;
};

export function getThemedComponents(theme: Theme) {
  return {
    components: {
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CBCDD8',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CBCDD8',
            },
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: '6px',
          },
          sizeLarge: {
            ...theme.typography.buttonL,
            padding: '10px 24px',
          },
          sizeMedium: {
            ...theme.typography.buttonM,
            padding: '6px 12px',
          },
          sizeSmall: {
            ...theme.typography.buttonS,
            padding: '0 6px',
          },
        },
        variants: [
          {
            props: { variant: 'surface' },
            style: {
              color: theme.palette.common.white,
              border: '1px solid',
              borderColor: '#FAFBFC1F',
              backgroundColor: '#2c2d3e',
              '&:hover, &.Mui-focusVisible': {
                backgroundColor: theme.palette.background.header,
              },
            },
          },
          {
            props: { variant: 'gradient' },
            style: {
              color: theme.palette.common.white,
              background: theme.palette.gradients.aaveGradient,
              transition: 'all 0.2s ease',
              '&:hover, &.Mui-focusVisible': {
                background: theme.palette.gradients.aaveGradient,
                opacity: '0.9',
              },
            },
          },
        ],
      },
      MuiTypography: {
        defaultProps: {
          variant: 'description',
          variantMapping: {
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
          PaperProps: {
            elevation: 0,
            variant: 'outlined',
            style: {
              minWidth: 240,
            },
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            padding: 0,
            '.MuiMenuItem-root+.MuiDivider-root': {
              marginTop: 0,
              marginBottom: 0,
            },
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
            ...theme.typography.subheader1,
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: theme.palette.primary.light,
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
            borderRadius: '4px',
          },
        },
        variants: [
          {
            props: { variant: 'outlined' },
            style: {
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
              background: theme.palette.background.surface,
            },
          },
          {
            props: { variant: 'elevation' },
            style: {
              boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
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
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            height: 20 + 6 * 2,
            width: 34 + 6 * 2,
            padding: 6,
          },
          switchBase: {
            padding: 8,
            '&.Mui-checked': {
              transform: 'translateX(14px)',
              '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.success.main,
                opacity: 1,
              },
            },
          },
          thumb: {
            color: '#fff',
            borderRadius: '6px',
            width: '16px',
            height: '16px',
          },
          track: {
            opacity: 1,
            backgroundColor: theme.palette.primary.light,
            borderRadius: '8px',
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
            borderColor: theme.palette.divider,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            fontFamily: FONT,
            fontWeight: 400,
            ...getFontSize(14, 14, 14),
            '> div:first-of-type': {
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        },
      },
    },
  } as ThemeOptions;
}
