import {
  CheckCircleIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  ExclamationIcon,
  InformationCircleIcon,
} from '@heroicons/react/outline';
import { SvgIcon, Theme, ThemeOptions } from '@mui/material';
import { createTheme } from '@mui/material/styles';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { ColorPartial } from '@mui/material/styles/createPalette';
import React from 'react';

import colors from './colors';
import { withOpacity } from './utils';

const theme = createTheme();
const {
  typography: { pxToRem },
} = theme;

const FONT = 'Inter, Arial';
const FONT_HEADING = 'Poppins';

declare module '@mui/material/styles/createPalette' {
  interface PaletteColor extends ColorPartial {}

  interface TypeText {
    primary: string;
    secondary: string;
    disabledText: string;
    disabledBg: string;
    mainTitle: string;
    subTitle: string;
    subText: string;
    buttonText: string;
    buttonBgTap: string;
    // to be removed
    muted: string;
  }

  interface TypeBackground {
    primary: string;
    secondary: string;
    tertiary: string;
    modulePopup: string;
    point: string;
    contents: string;
    dim: string;
    group: string;
    top: string;
    chip: string;
    // to be removed
    default: string;
    paper: string;
    surface: string;
    surface2: string;
    header: string;
    disabled: string;
    cardBg: string;
  }

  interface Palette {
    positive: {
      main: string;
    };
    negative: {
      main: string;
    };
    gradients: {
      aaveGradient: string;
      newGradient: string;
    };
    other: {
      standardInputLine: string;
    };
    border: {
      active: string;
      contents: string;
      point: string;
      divider: string;
      bg: string;
    };
    point: {
      primary: string;
      secondary: string;
      positive: string;
      negative: string;
      riskMedium: string;
      riskRow: string;
      riskHigh: string;
      noti: string;
    };
  }

  interface PaletteOptions {
    gradients: {
      aaveGradient: string;
      newGradient: string;
    };
  }
}

interface TypographyCustomVariants {
  h1: React.CSSProperties;
  h2: React.CSSProperties;
  h3: React.CSSProperties;
  h4: React.CSSProperties;
  h5: React.CSSProperties;
  h6: React.CSSProperties;
  body1: React.CSSProperties;
  body2: React.CSSProperties;
  body3: React.CSSProperties;
  body4: React.CSSProperties;
  body5: React.CSSProperties;
  body6: React.CSSProperties;
  body7: React.CSSProperties;
  body8: React.CSSProperties;
  body9: React.CSSProperties;
  detail1: React.CSSProperties;
  detail2: React.CSSProperties;
  detail3: React.CSSProperties;
  detail4: React.CSSProperties;
  detail5: React.CSSProperties;
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
    h1: true;
    h2: true;
    h3: true;
    h4: true;
    h5: true;
    h6: true;
    body1: true;
    body2: true;
    body3: true;
    body4: true;
    body5: true;
    body6: true;
    body7: true;
    body8: true;
    body9: true;
    detail1: true;
    detail2: true;
    detail3: true;
    detail4: true;
    detail5: true;

    // to be removed
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
    subtitle1: false;
    subtitle2: false;
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
      keys: ['xs', 'xsm', 'sm', 'md', 'lg', 'xl', 'xxl'],
      values: { xs: 0, xsm: 640, sm: 760, md: 960, mdlg: 1125, lg: 1280, xl: 1575, xxl: 1800 },
    },
    palette: {
      mode,
      primary: {
        main: getColor(colors.marine[500], colors.marine[300]),
      },
      secondary: {
        main: getColor(colors.violet[500], colors.violet[300]),
      },
      positive: {
        main: getColor(colors.green[500], colors.green[300]),
      },
      negative: {
        main: getColor(colors.red[400], colors.red[300]),
      },
      error: {
        main: getColor('#FF2D2D', '#F44336'),
      },
      warning: {
        main: getColor('#F89F1A', '#FFA726'),
      },
      info: {
        main: getColor('#0062D2', '#29B6F6'),
      },
      success: {
        main: getColor('#1FC74E', '#38E067'),
      },
      text: {
        primary: getColor(colors.gray[950], colors.gray[50]),
        secondary: getColor(colors.gray[700], colors.gray[200]),
        mainTitle: getColor(colors.gray[600], colors.gray[300]),
        subTitle: getColor(colors.gray[400], colors.gray[500]),
        subText: getColor(colors.gray[200], colors.gray[700]),
        disabledBg: getColor(colors.gray[100], colors.gray[800]),
        disabledText: getColor(colors.gray[300], colors.gray[600]),
        buttonText: getColor(colors.white, colors.white),
        buttonBgTap: getColor(colors.gray[50], colors.gray[950]),
      },
      point: {
        primary: getColor(colors.marine[500], colors.marine[300]),
        secondary: getColor(colors.violet[500], colors.violet[300]),
        positive: getColor(colors.green[500], colors.green[400]),
        negative: getColor(colors.red[400], colors.red[300]),
        riskMedium: getColor(
          withOpacity(colors.orange[50], 0.7),
          withOpacity(colors.orange[400], 0.3)
        ),
        riskRow: getColor(withOpacity(colors.blue[100], 0.4), withOpacity(colors.blue[400], 0.2)),
        riskHigh: getColor(withOpacity(colors.red[400], 0.1), withOpacity(colors.red[300], 0.2)),
        noti: getColor(withOpacity(colors.green[300], 0.3), withOpacity(colors.green[400], 0.2)),
      },
      background: {
        primary: getColor(colors.white, colors.gray[850]),
        secondary: getColor(colors.gray[50], colors.gray[800]),
        tertiary: getColor(colors.gray[100], colors.gray[900]),
        modulePopup: getColor(colors.white, withOpacity(colors.gray[700], 0.2)),
        point: getColor(colors.marine[50], withOpacity(colors.marine[900], 0.2)),
        contents: getColor(colors.gray[30], withOpacity(colors.gray[700], 0.5)),
        dim: getColor(withOpacity(colors.black, 0.6), withOpacity(colors.black, 0.6)),
        group: getColor(colors.marine[400], colors.marine[300]),
        top: getColor(withOpacity(colors.marine[300], 0.1), '#28216D'),
        chip: getColor(colors.marine[500], colors.marine[400]),
      },
      divider: getColor(colors.gray[100], colors.gray[800]),
      action: {
        active: getColor('#8E92A3', '#EBEBEF8F'),
        hover: getColor('#F1F1F3', '#EBEBEF14'),
        selected: getColor('#EAEBEF', '#EBEBEF29'),
        disabled: getColor('#BBBECA', '#EBEBEF4D'),
        disabledBackground: getColor('#EAEBEF', '#EBEBEF1F'),
        focus: getColor('#F1F1F3', '#EBEBEF1F'),
      },
      other: {
        standardInputLine: getColor('#383D511F', '#EBEBEF6B'),
      },
      gradients: {
        aaveGradient: 'linear-gradient(248.86deg, #B6509E 10.51%, #2EBAC6 93.41%)',
        newGradient: 'linear-gradient(79.67deg, #8C3EBC 0%, #007782 95.82%)',
      },
      border: {
        active: getColor(colors.gray[800], colors.gray[100]),
        contents: getColor(colors.gray[200], colors.gray[700]),
        divider: getColor(colors.gray[100], colors.gray[700]),
        point: getColor(withOpacity(colors.marine[300], 0.5), withOpacity(colors.marine[300], 0.5)),
        bg: getColor(colors.gray[50], colors.gray[950]),
      },
    },
    spacing: 4,
    typography: {
      fontFamily: FONT,
      h1: {
        fontFamily: FONT_HEADING,
        fontWeight: 700,
        lineHeight: '130%',
        fontSize: pxToRem(36),
      },
      h2: {
        fontFamily: FONT_HEADING,
        fontWeight: 700,
        lineHeight: '130%',
        fontSize: pxToRem(24),
      },
      h3: {
        fontFamily: FONT_HEADING,
        fontWeight: 700,
        lineHeight: '130%',
        fontSize: pxToRem(18),
      },
      h4: {
        fontFamily: FONT_HEADING,
        fontWeight: 400,
        lineHeight: '130%',
        fontSize: pxToRem(18),
      },
      h5: {
        fontFamily: FONT_HEADING,
        fontWeight: 700,
        lineHeight: '150%',
        fontSize: pxToRem(22),
      },
      h6: {
        fontFamily: FONT_HEADING,
        fontWeight: 700,
        lineHeight: '150%',
        fontSize: '30px',
      },
      body1: {
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: pxToRem(22),
        lineHeight: '130%',
      },
      body2: {
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: pxToRem(18),
        lineHeight: '130%',
      },
      body3: {
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: pxToRem(18),
        lineHeight: '140%',
      },
      body4: {
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: pxToRem(17),
        lineHeight: '130%',
      },
      body5: {
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: pxToRem(17),
        lineHeight: '130%',
      },
      body6: {
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: pxToRem(16),
        lineHeight: '130%',
      },
      body7: {
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: pxToRem(16),
        lineHeight: '130%',
      },
      body8: {
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: pxToRem(20),
        lineHeight: '130%',
      },
      body9: {
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: pxToRem(26),
        lineHeight: '130%',
      },
      detail1: {
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: pxToRem(14),
        lineHeight: '130%',
      },
      detail2: {
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: pxToRem(14),
        lineHeight: '130%',
      },
      detail3: {
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: pxToRem(14),
        lineHeight: '130%',
      },
      detail4: {
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: pxToRem(13),
        lineHeight: '130%',
      },
      detail5: {
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: pxToRem(15),
        lineHeight: '140%',
      },
    },
  } as ThemeOptions;
};

export function getThemedComponents(theme: Theme) {
  return {
    components: {
      MuiSkeleton: {
        styleOverrides: {
          root: {
            transform: 'unset',
            backgroundColor: theme.palette.text.disabledBg,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
            borderColor: theme.palette.divider,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CBCDD8',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CBCDD8',
            },
          },
        },
      },
      MuiSlider: {
        styleOverrides: {
          root: {
            '& .MuiSlider-thumb': {
              color: theme.palette.mode === 'light' ? '#62677B' : '#C9B3F9',
            },
            '& .MuiSlider-track': {
              color: theme.palette.mode === 'light' ? '#383D51' : '#9C93B3',
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
            textTransform: 'none',
          },
          sizeLarge: {
            borderRadius: '8px',
            padding: '12px 24px',
            fontWeight: 600,
            fontSize: 16,
          },
          sizeMedium: {
            borderRadius: '8px',
            padding: '12px 46.5px',
            fontSize: 16,
          },
          sizeSmall: {
            padding: '9px 8px',
          },
        },
        variants: [
          {
            props: { color: 'primary', variant: 'outlined' },
            style: {
              background: theme.palette.text.buttonText,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                background: theme.palette.text.buttonText,
                color: theme.palette.point.primary,
              },
            },
          },
          {
            props: { color: 'primary', variant: 'text' },
            style: {
              border: '1px solid',
              background: theme.palette.background.primary,
              borderColor: theme.palette.text.subText,
              color: theme.palette.text.primary,
            },
          },
          {
            props: { color: 'primary', disabled: true },
            style: {
              border: '1px solid',
              background: theme.palette.background.disabled,
              borderColor: theme.palette.border.contents,
              color: theme.palette.text.disabledText,
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
            h5: 'h5',
            h6: 'h6',
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
              marginTop: '4px',
            },
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            '.MuiMenuItem-root+.MuiDivider-root, .MuiDivider-root': {
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
            padding: '13.5px 12px',
            fontSize: '16px',
            fontWeight: 400,
          },
        },
        defaultProps: {
          sx: {
            '&.Mui-selected': {
              backgroundColor: theme.palette.background.group,
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: {
            color: theme.palette.primary.light,
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
            borderRadius: '16px',
          },
        },
        variants: [
          {
            props: { variant: 'outlined' },
            style: {
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
            },
          },
          {
            props: { variant: 'elevation' },
            style: {
              boxShadow: '4px 4px 20px 0px rgba(0, 0, 0, 0.05)',
              backgroundColor: theme.palette.background.primary,
              backgroundImage: 'unset',
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
            [theme.breakpoints.up('xs')]: {
              paddingLeft: '20px',
              paddingRight: '20px',
            },
            [theme.breakpoints.up('sm')]: {
              paddingLeft: '24px',
              paddingRight: '24px',
            },
            [theme.breakpoints.up('md')]: {
              paddingLeft: '32px',
              paddingRight: '32px',
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            width: 35,
            height: 20,
            padding: 0,
          },
          switchBase: {
            padding: 0,
            margin: '1px !important',
            transitionDuration: '300ms',
            '& + .MuiSwitch-track': {
              backgroundColor: `${theme.palette.text.subText} !important`,
            },
            '&.Mui-checked': {
              transform: 'translateX(15px)',
              color: '#FFF',
              '& + .MuiSwitch-track': {
                backgroundColor: `${theme.palette.point.primary} !important`,
                opacity: 1,
                border: 0,
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
              },
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
            },
          },
          thumb: {
            color: theme.palette.common.white,
            borderRadius: '100px',
            width: '18px',
            height: '18px',
            boxShadow: '1px 1px 1px 0px rgba(0, 0, 0, 0.05)',
          },
          track: {
            opacity: 1,
            borderRadius: '12px',
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
      MuiAlert: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderRadius: 0,
            padding: '8px 8px 8px 4px',
            ...theme.typography.body7,
            color: theme.palette.text.secondary,
            alignItems: 'flex-start',
            '.MuiAlert-message': {
              padding: 0,
            },
            '.MuiAlert-icon': {
              padding: 0,
              opacity: 1,
              marginRight: '8px',
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
              ...theme.typography.body7,
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
              <SvgIcon color="error" sx={{ color: '#FB8509' }}>
                <InformationCircleIcon />
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
              <SvgIcon
                color="warning"
                sx={{
                  color: theme.palette.point.negative,
                }}
              >
                <ExclamationCircleIcon />
              </SvgIcon>
            ),
          },
        },
        variants: [
          {
            props: { severity: 'error' },
            style: {
              background: theme.palette.point.riskMedium,
              a: {
                color: theme.palette.error['100'],
              },
              '.MuiButton-text': {
                color: theme.palette.error['100'],
              },
            },
          },
          {
            props: { severity: 'info' },
            style: {
              background: theme.palette.point.riskRow,
              a: {
                color: theme.palette.info['100'],
              },
            },
          },
          {
            props: { severity: 'success' },
            style: {
              color: theme.palette.success['100'],
              background: theme.palette.success['200'],
              a: {
                color: theme.palette.success['100'],
              },
              '.MuiButton-text': {
                color: theme.palette.success['100'],
              },
            },
          },
          {
            props: { severity: 'warning' },
            style: {
              background: theme.palette.point.riskHigh,
              a: {
                color: theme.palette.primary.main,
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
            backgroundColor: theme.palette.mode === 'light' ? colors.gray[50] : colors.gray[800],
            '> div:first-of-type': {
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          colorPrimary: {
            color: theme.palette.primary.light,
          },
        },
      },
      MuiSelect: {
        defaultProps: {
          IconComponent: (props) => (
            <SvgIcon sx={{ fontSize: '16px' }} {...props}>
              <ChevronDownIcon />
            </SvgIcon>
          ),
        },
        styleOverrides: {
          outlined: {
            backgroundColor: theme.palette.background.surface,
            padding: '6px 12px',
            color: theme.palette.primary.light,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          bar1Indeterminate: {
            background: theme.palette.gradients.aaveGradient,
          },
          bar2Indeterminate: {
            background: theme.palette.gradients.aaveGradient,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            paddingBlock: '3px',
            paddingInline: '4px',
            borderRadius: '4px',
            height: 'fit-content',
          },
          label: {
            ...theme.typography.detail2,
            padding: 0,
          },
        },
      },
    },
  } as ThemeOptions;
}

// fasfd
