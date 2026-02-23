import { createTheme } from '@mui/material/styles';

import alertConfig from './alert';
import buttonConfig from './button';
import checkboxConfig from './checkbox';
import inputConfig from './input';
import switchConfig from './switch';

const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: '#80FF00',
      dark: '#192328',
    },

    secondary: {
      main: '#E0E0E0',
    },

    text: {
      primary: '#FFF',
      secondary: '#757575',
      muted: '#546066',
    },

    background: {
      default: '#000000',
      paper: '#ffffff09',
      surface: '#192328',
      surface2: '#0D1112',
      disabled: '#0D1112',
      header: '#192328',
    },

    info: {
      main: '#B3CCD9',
    },

    accent: { main: '#80FF00' },

    action: {
      disabled: '#546066',
    },
  },

  breakpoints: {
    values: {
      xs: 0,
      xsm: 600,
      sm: 768,
      md: 1024,
      lg: 1440,
      xl: 1920,
    },
  },

  components: {
    ...buttonConfig(),
    //...selectConfig(),
    ...checkboxConfig(),
    ...switchConfig(),
    ...inputConfig(),
    ...alertConfig(),
  },
});

export { theme };
