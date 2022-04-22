import React from 'react';
import Box from '@mui/material/Box';
import { FormattedNumber } from './primitives/FormattedNumber';

type ReserveSubheaderProps = {
  value: string;
  rightAlign?: boolean;
};

export function ReserveSubheader({ value, rightAlign }: ReserveSubheaderProps) {
  return (
    <Box
      sx={{
        p: rightAlign ? { xs: '0', xsm: '2px 0' } : { xs: '0', xsm: '3.625px 0px' },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <FormattedNumber
        compact
        value={value}
        variant="secondary12"
        color="text.secondary"
        symbolsVariant="secondary12"
        symbolsColor="text.secondary"
        symbol="USD"
      />
    </Box>
  );
}
