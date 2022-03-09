import { Typography } from '@mui/material';
import { ReactElement } from 'react';

export type TxModalTitleProps = {
  title: ReactElement;
  symbol?: string;
};

export const TxModalTitle = ({ title, symbol }: TxModalTitleProps) => {
  return (
    <Typography variant="h2" sx={{ mb: 6 }}>
      {title} {symbol ?? ''}
    </Typography>
  );
};
