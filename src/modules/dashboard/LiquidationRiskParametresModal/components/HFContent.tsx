import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';

import { FormattedNumber } from '../../../../components/primitives/FormattedNumber';

interface HFContentProps {
  healthFactor: string;
}

export const HFContent = ({ healthFactor }: HFContentProps) => {
  const formattedHealthFactor = Number(
    valueToBigNumber(healthFactor).toFixed(2, BigNumber.ROUND_DOWN)
  );

  let dotPosition = 0;
  if (+healthFactor > 10) {
    dotPosition = 100;
  } else if (+healthFactor < 10 && +healthFactor > 7) {
    dotPosition = 85;
  } else if (+healthFactor < 7 && +healthFactor > 5) {
    dotPosition = 75;
  } else if (+healthFactor < 5 && +healthFactor > 4) {
    dotPosition = 70;
  } else if (+healthFactor < 4 && +healthFactor > 3.5) {
    dotPosition = 65;
  } else if (+healthFactor < 3.5 && +healthFactor > 3) {
    dotPosition = 60;
  } else if (+healthFactor < 3 && +healthFactor > 2.5) {
    dotPosition = 50;
  } else if (+healthFactor < 2.5 && +healthFactor > 2) {
    dotPosition = 40;
  } else if (+healthFactor < 2 && +healthFactor > 1.5) {
    dotPosition = 30;
  } else if (+healthFactor < 1.5 && +healthFactor > 1.3) {
    dotPosition = 20;
  } else if (+healthFactor < 1.3 && +healthFactor > 1.2) {
    dotPosition = 15;
  } else if (+healthFactor < 1.2 && +healthFactor > 1.1) {
    dotPosition = 10;
  } else if (+healthFactor === 1) {
    dotPosition = 0;
  }

  return (
    <Box sx={{ position: 'relative', mt: '33px', mb: 4 }}>
      <Box
        sx={{
          height: '4px',
          background: 'linear-gradient(90deg, #46BC4B 0%, #F89F1A 52.08%, #BC0000 100%)',
          borderRadius: '1px',
          transform: 'matrix(-1, 0, 0, 1, 0, 0)',
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: '100%',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          left: `${dotPosition}%`,
        }}
      >
        <FormattedNumber value={formattedHealthFactor} variant="main12" visibleDecimals={2} />
        <Box
          sx={(theme) => ({
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '6px 4px 0 4px',
            borderColor: `${theme.palette.primary.main} transparent transparent transparent`,
          })}
        />
      </Box>

      <Box
        sx={{
          maxWidth: '56px',
          textAlign: 'center',
          pt: 1.5,
          position: 'relative',
          '&:after': {
            content: "''",
            position: 'absolute',
            bottom: '85%',
            left: '50%',
            transform: 'translateX(-50%)',
            height: '10px',
            width: '2px',
            bgcolor: 'error.main',
          },
        }}
      >
        <FormattedNumber value={1} visibleDecimals={2} color="error.main" variant="subheader2" />
        <Typography
          sx={{ display: 'flex' }}
          variant="helperText"
          lineHeight="12px"
          color="error.main"
        >
          <Trans>Liquidation value</Trans>
        </Typography>
      </Box>
    </Box>
  );
};
