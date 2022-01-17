import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import AppHeader from "./AppHeader";
import { getTheme } from "../utils/theme";
import { useMediaQuery } from "@mui/material";

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

type Mode = "light" | "dark";

/**
 * Main Layout component which wrapps around the whole app
 * @param param0
 * @returns
 */
export const MainLayout: React.FC = ({ children }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [mode, setMode] = React.useState<Mode>(
    prefersDarkMode ? "dark" : "light"
  );
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          localStorage.setItem("colorMode", newMode);
          return newMode;
        });
      },
    }),
    []
  );

  React.useEffect(() => {
    const initialMode = localStorage?.getItem("colorMode") as Mode;
    if (initialMode) {
      setMode(initialMode);
    } else if (prefersDarkMode) {
      setMode("dark");
    }
  }, []);

  const theme = React.useMemo(() => getTheme(mode), [mode]);
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <AppHeader />
        <main>{children}</main>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
