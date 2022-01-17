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

  interface PaletteOptions {
    primaryDark: PaletteColorOptions;
  }
  interface Palette {
    primaryDark: PaletteColor;
  }
}

export const blueDark = {
  50: "#E2EDF8",
  100: "#CEE0F3",
  200: "#91B9E3",
  300: "#5090D3",
  main: "#5090D3",
  400: "#265D97",
  500: "#1E4976",
  600: "#173A5E",
  700: "#132F4C", // contrast 13.64:1
  800: "#001E3C",
  900: "#0A1929",
};

// Create a theme instance.
export const getTheme = (mode: "light" | "dark") =>
  createTheme({
    palette: {
      primary: {
        main: "#ff0000",
      },
      primaryDark: blueDark,
      secondary: {
        main: "#19857b",
      },
      error: {
        main: red.A400,
      },
      background: {
        default: mode === "dark" ? "#171926" : "#ffffff",
      },
      mode,
    },
    typography: {
      fontFamily: "Inter, Arial",
    },
  });

export default getTheme("light");
