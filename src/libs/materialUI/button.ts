import { ButtonOwnProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

const buttonConfig = () => ({
  MuiButton: {
    styleOverrides: {
      root: ({ ownerState, theme }: { ownerState: ButtonOwnProps; theme: Theme }) => ({
        textTransform: 'capitalize',

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

        ...(ownerState.color === 'primary' && {
          transition: 'opacity 0.25s ease',

          '&:hover': {
            backgroundColor: theme.palette.primary.main,
            opacity: 0.8,
          },
        }),
      }),
    },
  },
});

export default buttonConfig;
