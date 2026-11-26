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

const ROW_SX = { display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 } as const;

const H3_ROW_SX = { ...ROW_SX, gap: '0.625rem' } as const;

export const ValueChange = ({ current, after, variant = 'h5' }: ValueChangeProps) => (
  <Box sx={variant === 'h3' ? H3_ROW_SX : ROW_SX}>
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
