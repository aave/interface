import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    accent: Palette['primary'];
  }
  interface PaletteOptions {
    accent?: PaletteOptions['primary'];
  }
}

declare module '@mui/material/styles' {
  interface TypeAction {
    disabledText: string;
  }
  interface TypeText {
    muted?: string;
  }
  interface TypeBackground {
    surface?: string;
    surface2?: string;
    disabled?: string;
    header?: string;
  }
}
