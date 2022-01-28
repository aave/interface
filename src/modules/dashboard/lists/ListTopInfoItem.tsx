import { Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { FormattedNumber } from '../../../components/primitives/FormattedNumber';

interface ListTopInfoItemProps {
  title: ReactNode;
  value: number | string;
  percent?: boolean;
}

export const ListTopInfoItem = ({ title, value, percent }: ListTopInfoItemProps) => {
  return (
    <Paper
      variant="outlined"
      sx={{ mr: 2, p: '2px 4px', display: 'flex', alignItems: 'center', boxShadow: 'none' }}
    >
      <Typography color="text.secondary" sx={{ mr: 1 }}>
        {title}
      </Typography>
      <FormattedNumber value={value} percent={percent} variant="main14" symbol="USD" />
    </Paper>
  );
};
