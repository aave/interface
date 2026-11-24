import { Box, Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';
import { ArrowRightIcon } from 'src/components/icons/ArrowRightIcon';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

import { Variation } from '../../utils/types';

interface ValueChangeProps {
  current: ReactNode;
  after: ReactNode;
  variant?: TypographyProps['variant'];
}

export const ValueChange = ({ current, after, variant = 'h5' }: ValueChangeProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
    <Typography variant={variant} color="fg-3" component="div" sx={{ display: 'flex' }}>
      {current}
    </Typography>
    <ArrowRightIcon />
    <Typography variant={variant} color="fg-1" component="div" sx={{ display: 'flex' }}>
      {after}
    </Typography>
  </Box>
);

export const NumberChange = ({
  value,
  percent,
  symbol,
}: {
  value: Variation<number>;
  percent?: boolean;
  symbol?: string;
}) => (
  <ValueChange
    current={
      <FormattedNumber value={value.current} percent={percent} symbol={symbol} variant="inherit" />
    }
    after={
      <FormattedNumber value={value.after} percent={percent} symbol={symbol} variant="inherit" />
    }
  />
);
