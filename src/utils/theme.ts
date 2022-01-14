import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";

declare module "@mui/material/styles/createPalette" {
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

  interface Palette {
    primaryDark: PaletteColor;
  }
}

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#556cd6",
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: "Inter, Arial",
  },
  components: {},
});

export default theme;
