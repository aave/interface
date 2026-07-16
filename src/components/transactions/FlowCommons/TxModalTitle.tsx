import { Typography } from '@mui/material';
import { ReactNode } from 'react';

export type TxModalTitleProps = {
  title: ReactNode;
  symbol?: string;
};

export const TxModalTitle = ({ title, symbol }: TxModalTitleProps) => {
  return (
    <Typography
      variant="h2"
      sx={(theme) => ({
        mb: 6,
        color: theme.palette.fig['fg-1'],
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: '1.5rem',
      })}
    >
      {title} {symbol ?? ''}
    </Typography>
  );
};
