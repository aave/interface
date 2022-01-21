import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles/createPalette' {
  interface ColorRange {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface PaletteColor extends ColorRange {}

  interface PaletteOptions {
    primaryDark: PaletteColorOptions;
  }
  interface Palette {
    primaryDark: PaletteColor;
  }
}

export const blueDark = {
  50: '#E2EDF8',
  100: '#CEE0F3',
  200: '#91B9E3',
  300: '#5090D3',
  main: '#5090D3',
  400: '#265D97',
  500: '#1E4976',
  600: '#173A5E',
  700: '#132F4C', // contrast 13.64:1
  800: '#001E3C',
  900: '#0A1929',
};

// Create a theme instance.
export const getTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      primary: {
        main: '#171926',
      },
      primaryDark: blueDark,
      secondary: {
        light: 'rgba(242, 243, 247, 0,4)',
        main: 'rgba(242, 243, 247, 0,4)',
      },
      error: {
        main: red.A400,
      },
      background: {
        default: mode === 'dark' ? '#171926' : '#ffffff',
      },
      mode,
      text: {
        secondary: 'rgba(23, 25, 38, 0,48)',
      },
    },
    spacing: 4,
    typography: {
      fontFamily: 'Inter, Arial',
      fontSize: 14,
    },
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
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          outlinedSecondary: {
            border: '1px solid #E6E8F0',
            color: '#171926',
            '&:hover': {
              border: '1px solid #CBCDD8',
            },
            '&:focus': {
              border: '1px solid #CBCDD8',
            },
          },
        },
      },
    },
  });

export default getTheme('light');
