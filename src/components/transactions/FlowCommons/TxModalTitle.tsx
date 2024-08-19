import { BoxProps, Typography } from '@mui/material';
import { ReactNode } from 'react';

export type TxModalTitleProps = {
  title: ReactNode;
  symbol?: string;
  sx?: BoxProps;
};

export const TxModalTitle = ({ title, symbol, sx }: TxModalTitleProps) => {
  return (
    <Typography variant="h5" sx={{ color: 'text.primary', ...sx }}>
      {title} {symbol ?? ''}
    </Typography>
  );
};
