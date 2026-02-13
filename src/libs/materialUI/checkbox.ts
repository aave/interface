import { Theme } from '@mui/material/styles';

const checkboxConfig = () => ({
  MuiCheckbox: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.accent.main,

        '& svg': {
          color: theme.palette.accent.main,
        },
      }),
    },
  },
});

export default checkboxConfig;
