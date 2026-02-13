import '@mui/material/Button';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    text: true;
    outlined: true;
    contained: true;
    surface: true;
    gradient: true;
  }

  interface ButtonPropsSizeOverrides {
    small: true;
    standard: true;
  }

  interface ButtonPropsColorOverrides {
    primary: true;
    secondary: true;
    accent: true;
  }
}
