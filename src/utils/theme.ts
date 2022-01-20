import { createTheme } from '@mui/material/styles';

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

// Create a theme instance.
export const getTheme = (mode: 'light' | 'dark') => {
  const getColor = (lightColor: string, darkColor: string) =>
    mode === 'dark' ? darkColor : lightColor;

  return createTheme({
    breakpoints: {
      keys: ['xs', 'sm', 'md', 'lg', 'xl'],
      values: { xs: 0, sm: 768, md: 1024, lg: 1728, xl: 1920 },
    },
    palette: {
      mode,
      primary: {
        main: getColor('#00244D', '#FAFBFC'),
        light: getColor('#47617F', '#FAFBFC'),
        dark: getColor('#00244D', '#FAFBFCA3'),
      },
      secondary: {
        main: getColor('#FF607B', '#F48FB1'),
        light: getColor('#FF607B', '#F6A5C0'),
        dark: getColor('#FF607B', '#AA647B'),
      },
      error: {
        main: getColor('#BC0000B8', '#F44336'),
        light: getColor('#BC0000B8', '#E57373'),
        dark: getColor('#BC0000', '#D32F2F'),
      },
      warning: {
        main: getColor('#F89F1A', '#FFA726'),
        light: getColor('#FFCE00', '#FFB74D'),
        dark: getColor('#F89F1A', '#F57C00'),
      },
      info: {
        main: getColor('#0062D2', '#29B6F6'),
        light: getColor('#0062D2', '#4FC3F7'),
        dark: getColor('#0062D2', '#0288D1'),
      },
      success: {
        main: getColor('#4CAF50', '#66BB6A'),
        light: getColor('#46BC4B', '#90FF95'),
        dark: getColor('#46BC4B', '#388E3C'),
      },
      text: {
        primary: getColor('#00244D', '#FFFFFF'),
        secondary: getColor('#47617F', '#FFFFFFB2'),
        disabled: getColor('#00244D61', '#FFFFFF80'),
      },
      background: {
        default: getColor('#FAFBFC', '#090815'),
        paper: getColor('#FFFFFF', '#272631'),
        surface: getColor('#FAFBFC', '#2c2d3e'),
        header: getColor('#020e1f', '#090815'),
      },
      divider: getColor('#E0E5EA', '#FFFFFF1F'),
      action: {
        active: getColor('#00244D8A', '#FFFFFF8F'),
        hover: getColor('#00244D0A', '#FFFFFF14'),
        selected: getColor('#00244D14', '#FFFFFF29'),
        disabled: getColor('#00244D42', '#FFFFFF4D'),
        disabledBackground: getColor('#00244D42', '#FFFFFF1F'),
        focus: getColor('#00244D1F', '#FFFFFF1F'),
      },
      gradients: {
        aaveGradient: 'linear-gradient(248.86deg, #B6509E 10.51%, #2EBAC6 93.41%);',
      },
    },
    spacing: 4,
    typography: {
      fontFamily: 'Inter, Arial',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });
};

export default getTheme('light');
