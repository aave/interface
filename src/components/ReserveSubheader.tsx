import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';

import { FormattedNumber } from './primitives/FormattedNumber';

type ReserveSubheaderProps = {
  value: string;
};

export function ReserveSubheader({ value }: ReserveSubheaderProps) {
  return (
    <Box
      sx={{
        mt: '2px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {value === 'Disabled' ? (
        <Typography component="span" sx={{ mr: 0.5 }} variant="description" color="fg-3">
          (<Trans>Disabled</Trans>)
        </Typography>
      ) : (
        <FormattedNumber compact value={value} variant="description" color="fg-2" symbol="USD" />
      )}
    </Box>
  );
}
