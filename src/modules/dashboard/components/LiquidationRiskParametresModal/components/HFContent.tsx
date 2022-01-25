import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import React from 'react';

import { FormattedNumber } from '../../../../../components/primitives/FormattedNumber';

interface HFContentProps {
  healthFactor: string;
}

export const HFContent = ({ healthFactor }: HFContentProps) => {
  let dotPosition = 0;
  if (+healthFactor > 10) {
    dotPosition = 1;
  } else if (+healthFactor < 10 && +healthFactor > 5) {
    dotPosition = 15;
  } else if (+healthFactor < 5 && +healthFactor > 3) {
    dotPosition = 25;
  } else if (+healthFactor < 3 && +healthFactor > 2) {
    dotPosition = 35;
  } else if (+healthFactor < 2 && +healthFactor > 1.5) {
    dotPosition = 55;
  } else if (+healthFactor < 1.5 && +healthFactor > 1.3) {
    dotPosition = 65;
  } else if (+healthFactor < 1.3 && +healthFactor > 1.2) {
    dotPosition = 75;
  } else if (+healthFactor < 1.2 && +healthFactor > 1.15) {
    dotPosition = 85;
  } else if (+healthFactor < 1.15 && +healthFactor > 1.1) {
    dotPosition = 90;
  } else if (+healthFactor < 1.1 && +healthFactor > 1) {
    dotPosition = 95;
  } else if (+healthFactor === 1) {
    dotPosition = 100;
  }

  return (
    <Box sx={{ position: 'relative', m: '30px 0 55px' }}>
      <Typography
        variant="secondary12"
        sx={{ position: 'absolute', left: 0, bottom: 'calc(100% + 4px)', color: 'success.main' }}
      >
        <Trans>Safer</Trans>
      </Typography>
      <Typography
        variant="secondary12"
        sx={{ position: 'absolute', right: 0, bottom: 'calc(100% + 4px)', color: 'success.error' }}
      >
        <Trans>Riskier</Trans>
      </Typography>

      <Box
        sx={{
          height: '6px',
          background: 'linear-gradient(90deg, #65c970 0%, #ffac4d 52.5%, #de5959 100%)',
          borderRadius: '8px',
        }}
      >
        <Box
          sx={{
            width: '16px',
            height: '16px',
            boxShadow: 'rgb(0 0 0 / 16%) 0px 1px 3px 0px',
            bgcolor: 'common.white',
            borderRadius: '50%',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: `${dotPosition}%`,
          }}
        />
      </Box>

      <Box sx={{ position: 'absolute', top: 'calc(100% + 12px)', right: '-5px' }}>
        <Box
          sx={(theme) => ({
            position: 'relative',
            whiteSpace: 'nowrap',
            '&:after': {
              content: "''",
              position: 'absolute',
              width: 0,
              height: 0,
              right: 0,
              bottom: 'calc(100% + 2px)',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: `8px solid ${theme.palette.error.main}`,
            },
          })}
        >
          <Box
            sx={{
              display: 'flex',
              position: 'absolute',
              flexDirection: 'column',
              alignItems: 'flex-end',
              right: 0,
            }}
          >
            <Typography variant="secondary12">
              <Trans>Liquidation value</Trans>
            </Typography>

            <Box sx={{ display: 'flex' }}>
              <FormattedNumber value={0.01} variant="secondary12" percent />
              <Typography variant="secondary12">*</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
