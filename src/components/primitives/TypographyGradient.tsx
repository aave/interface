import { Typography, TypographyProps } from '@mui/material';

export const TypographyGradient = ({ ...rest }: TypographyProps) => {
  return (
    <Typography
      sx={(theme) => ({
        color: theme.palette.text.primary,
      })}
      {...rest}
    >
      {rest.children}
    </Typography>
  );
};
