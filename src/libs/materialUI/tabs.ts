import { Theme } from '@mui/material/styles';

const tabsConfig = () => ({
  MuiTabs: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: 2,
      },

      indicator: ({ theme }: { theme: Theme }) => ({
        height: '100%',
        backgroundColor: 'transparent',
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: 6,
      }),
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        color: '#192328',
        transition: 'color 0.25s ease',

        '&&.Mui-selected': {
          color: '#fff',
        },
      },
    },
  },
});

export default tabsConfig;
