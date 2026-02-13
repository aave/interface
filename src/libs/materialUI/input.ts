import { OutlinedInputProps } from '@mui/material/OutlinedInput';
import { Theme } from '@mui/material/styles';

const inputConfig = () => ({
  MuiInput: {
    defaultProps: {
      disableUnderline: true,
    },
    styleOverrides: {
      root: ({ ownerState, theme }: { ownerState: OutlinedInputProps; theme: Theme }) => ({
        height: 48,
        border: `1px solid ${theme.palette.primary.main}`,
        borderRadius: 8,
        transition: 'border-color 0.25s ease, background-color 0.25s ease',

        '& fieldset': {
          borderColor: theme.palette.primary.main,
        },

        // hover
        '&:hover fieldset': {
          borderColor: theme.palette.accent.main,
        },

        // focus / pressed
        '&.Mui-focused fieldset': {
          borderColor: theme.palette.accent.main,
          borderWidth: 1,
        },

        ...(ownerState.color === 'accent' && {
          backgroundColor: theme.palette.accent.main,

          '& fieldset': {
            borderColor: theme.palette.accent.main,
          },

          '& input': {
            color: theme.palette.text.secondary,
          },
        }),

        ...(ownerState.disabled && {
          backgroundColor: theme.palette.primary.dark,
          opacity: 0.4,

          '& fieldset': {
            borderColor: theme.palette.primary.main,
          },
        }),
      }),

      input: ({ theme }: { theme: Theme }) => ({
        padding: '12px 16px',
        fontSize: 14,
        lineHeight: '20px',
        color: theme.palette.text.primary,

        '&::placeholder': {
          color: theme.palette.text.primary,
          opacity: 0.5,
        },
      }),
    },
  },
});

export default inputConfig;
