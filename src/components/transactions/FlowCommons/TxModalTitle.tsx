import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';

export type TxModalTitleProps = {
  title: string;
  symbol?: string;
};

export const TxModalTitle = ({ title, symbol }: TxModalTitleProps) => {
  return (
    <Typography variant="h2" sx={{ mb: 6 }}>
      <Trans>{title}</Trans> {symbol ?? ''}
    </Typography>
  );
};
