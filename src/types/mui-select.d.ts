import '@mui/material/Select';

declare module '@mui/material/Select' {
  interface SelectPropsColorOverrides {
    primary: true;
    secondary: true;
    accent: true;
  }

  interface SelectPropsSizeOverrides {
    small: true;
    standard: true;
    e_mode: true;
  }
}

declare module '@mui/material/InputBase' {
  interface InputBasePropsColorOverrides {
    accent: true;
  }
}
