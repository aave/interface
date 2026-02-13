import { Theme } from '@mui/material/styles';

const switchConfig = () => ({
  MuiSwitch: {
    styleOverrides: {
      root: ({ theme }: { theme: Theme }) => ({
        padding: 6,

        '& .Mui-checked+.MuiSwitch-track': {
          opacity: 1,
          border: `1px solid ${theme.palette.accent.main}`,
        },
      }),

      thumb: ({ theme }: { theme: Theme }) => ({
        color: theme.palette.accent.main,
      }),

      track: ({ theme }: { theme: Theme }) => ({
        borderRadius: 30,
        backgroundColor: theme.palette.primary.main,
        opacity: 1,
        border: '0px solid transparent',
        transition: 'border-color 0.25s ease',
      }),
    },
  },
});

export default switchConfig;
