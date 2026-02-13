import { OutlinedInputProps, SelectProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

const selectConfig = () => ({
  MuiSelect: {
    styleOverrides: {
      select: ({ ownerState }: { ownerState: SelectProps; theme: Theme }) => ({
        padding: '10px 40px 10px 16px',
        fontSize: 14,
        lineHeight: '20px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease',

        ...(ownerState.size === 'small' && {
          padding: '4px 32px 4px 12px',
          fontSize: 12,
          borderRadius: 4,
        }),
      }),

      icon: ({ theme }: { theme: Theme }) => ({
        right: 12,
        color: theme.palette.text.primary,
        transition: 'color 0.25s ease',
      }),
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ ownerState, theme }: { ownerState: OutlinedInputProps; theme: Theme }) => ({
        backgroundColor: theme.palette.primary.dark,
        borderRadius: 8,
        transition: 'background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease',

        '& fieldset': {
          borderColor: theme.palette.primary.main,
        },

        '&:hover fieldset': {
          borderColor: theme.palette.accent.main,
        },

        '&:hover': {
          backgroundColor: theme.palette.accent.main,

          '& .MuiSelect-icon': {
            color: theme.palette.text.secondary,
          },

          '& .MuiSelect-select': {
            color: theme.palette.text.secondary,
          },
        },

        ...(ownerState.color === 'accent' && {
          backgroundColor: theme.palette.accent.main,

          '& fieldset': {
            borderColor: theme.palette.accent.main,
          },

          '& .MuiSelect-select': {
            color: theme.palette.text.secondary,
          },

          '& .MuiSelect-icon': {
            color: theme.palette.text.secondary,
          },
        }),
      }),
    },
  },
});

export default selectConfig;
