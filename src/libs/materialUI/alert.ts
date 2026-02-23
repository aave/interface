import { AlertProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

const alertConfig = () => ({
  MuiAlert: {
    styleOverrides: {
      root: ({ ownerState }: { ownerState: AlertProps; theme: Theme }) => ({
        ...(ownerState.severity === 'warning' && {
          backgroundColor: '#FFF4E5',
          color: '#663C00',
        }),
      }),
    },
  },
});

export default alertConfig;
