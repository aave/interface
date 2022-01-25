import Typography, { TypographyProps } from '@mui/material/Typography';

export const NoData = ({ ...rest }: TypographyProps) => {
  return <Typography {...rest}>—</Typography>;
};
