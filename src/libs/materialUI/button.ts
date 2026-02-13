import { ButtonOwnProps } from '@mui/material';
import { Theme } from '@mui/material/styles';

const buttonConfig = () => ({
  MuiButton: {
    styleOverrides: {
      root: ({ ownerState, theme }: { ownerState: ButtonOwnProps; theme: Theme }) => ({
        paddingBlock: 10,
        paddingInline: 40,
        borderRadius: 8,
        fontSize: 14,
        lineHeight: '20px',
        transition: 'color 0.25s ease, background-color 0.25s ease',

        '&:hover': {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.accent.main,
        },

        ...(ownerState.color === 'secondary' && {
          backgroundColor: theme.palette.primary.dark,
          border: `1px solid ${theme.palette.primary.main}`,
          transition: 'color 0.25s ease, background-color 0.25s ease, border-color 0.25s ease',

          '&:hover': {
            color: theme.palette.text.secondary,
            backgroundColor: theme.palette.accent.main,
            border: `1px solid ${theme.palette.accent.main}`,
          },
        }),

        ...(ownerState.color === 'accent' && {
          color: theme.palette.text.secondary,
          backgroundColor: theme.palette.accent.main,
        }),

        ...(ownerState.size === 'small' && {
          paddingBlock: 4,
          paddingInline: 28,
          borderRadius: 4,
          fontSize: 12,
        }),

        ...(ownerState.variant === 'outlined' && {
          backgroundColor: 'transparent',
          color: ownerState.color,
          transition: 'color 0.25s ease, border-color 0.25s ease',

          '&:hover': {
            color: theme.palette.accent.main,
            border: `1px solid ${theme.palette.accent.main}`,
          },
        }),

        ...(ownerState.variant === 'text' && {
          backgroundColor: 'transparent',
          color: ownerState.color,
          transition: 'color 0.25s ease',

          '&:hover': {
            color: theme.palette.accent.main,
            backgroundColor: 'transparent',
          },
        }),

        ...(ownerState.variant === 'gradient' && {
          background: `linear-gradient(90deg, ${theme.palette.accent.main} 0%, ${theme.palette.primary.main} 100%)`,
          color: theme.palette.text.primary,
          border: 'none',

          '&:hover': {
            opacity: 0.9,
          },
        }),

        ...(ownerState.variant === 'surface' && {
          backgroundColor: theme.palette.background.paper ?? theme.palette.primary.dark,
          color: ownerState.color,
          border: `1px solid ${theme.palette.divider}`,
          transition: 'color 0.25s ease, background-color 0.25s ease',

          '&:hover': {
            color: theme.palette.text.secondary,
            backgroundColor: theme.palette.accent.main,
          },
        }),
      }),
    },
  },
});

export default buttonConfig;
