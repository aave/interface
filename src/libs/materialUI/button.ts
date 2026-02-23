import { ButtonOwnProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

const buttonConfig = () => ({
  MuiButton: {
    styleOverrides: {
      root: ({ ownerState }: { ownerState: ButtonOwnProps; theme: Theme }) => ({
        ...(ownerState.size === 'small' && {
          paddingBlock: 4,
          paddingInline: 8,
        }),

        ...(ownerState.variant === 'outlined' && {
          backgroundColor: '#FFFFFF1F',
          borderColor: '#FFFFFF4D',
          color: '#FFF',
          transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',

          '&:hover': {
            backgroundColor: '#ffffff14',
          },
        }),
      }),
    },
  },
});

export default buttonConfig;
