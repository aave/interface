import { SxProps, Theme, Typography } from '@mui/material';
import { ReactNode } from 'react';

export type TxModalTitleProps = {
  title: ReactNode;
  symbol?: string;
  sx?: SxProps<Theme>;
};

export const TxModalTitle = ({ title, symbol, sx }: TxModalTitleProps) => {
  return (
    <Typography
      variant="h2"
      sx={[
        {
          mb: 6,
          color: 'fg-1',
          fontSize: '1rem',
          fontWeight: 500,
          lineHeight: '1.5rem',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {title} {symbol ?? ''}
    </Typography>
  );
};
