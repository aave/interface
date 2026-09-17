import { Typography, TypographyProps } from '@mui/material';

export const TypographyGradient = ({ ...rest }: TypographyProps) => {
  return (
    <Typography sx={{ color: 'purple-1' }} {...rest}>
      {rest.children}
    </Typography>
  );
};
