import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';

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
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {value === 'Disabled' ? (
        <Typography component="span" sx={{ mr: 0.5 }} variant="detail2" color="text.mainTitle">
          (<Trans>Disabled</Trans>)
        </Typography>
      ) : (
        <FormattedNumber
          compact
          value={value}
          variant="detail2"
          color="text.mainTitle"
          symbolsVariant="secondary12"
          symbolsColor="text.secondary"
          symbol="USD"
        />
      )}
    </Box>
  );
}
