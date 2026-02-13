import { createTheme } from '@mui/material/styles';

import buttonConfig from './button';
import checkboxConfig from './checkbox';
import inputConfig from './input';
import selectConfig from './select';
import switchConfig from './switch';
import tabsConfig from './tabs';

const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: {
      main: '#30434D',
      dark: '#192328',
    },

    secondary: {
      main: '#405966',
    },

    text: {
      primary: '#B3CCD9',
      secondary: '#192328',
    },

    background: {
      default: '#000000',
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
      sm: 768,
      md: 1024,
      lg: 1440,
      xl: 1920,
    },
  },

  components: {
    ...buttonConfig(),
    ...selectConfig(),
    ...checkboxConfig(),
    ...switchConfig(),
    ...tabsConfig(),
    ...inputConfig(),
  },
});

export { theme };
