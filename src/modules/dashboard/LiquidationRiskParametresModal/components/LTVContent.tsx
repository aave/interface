import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';
import BigNumber from 'bignumber.js';

import { FormattedNumber } from '../../../../components/primitives/FormattedNumber';

interface LTVContentProps {
  loanToValue: string;
  currentLoanToValue: string;
  currentLiquidationThreshold: string;
}

export const LTVContent = ({
  loanToValue,
  currentLoanToValue,
  currentLiquidationThreshold,
}: LTVContentProps) => {
  const { palette } = useTheme();

  const LTVLineWidth = valueToBigNumber(loanToValue)
    .div(currentLiquidationThreshold)
    .multipliedBy(100)
    .precision(20, BigNumber.ROUND_UP)
    .toNumber();

  const MaxLTVLineLeftPosition = valueToBigNumber(currentLoanToValue)
    .div(currentLiquidationThreshold)
    .multipliedBy(100)
    .precision(20, BigNumber.ROUND_UP)
    .toNumber();

  let LTVLineColor = palette.primary.main;
  if (loanToValue >= currentLoanToValue) {
    LTVLineColor = palette.warning.main;
  } else if ((+currentLiquidationThreshold - +loanToValue) * 100 <= 3) {
    LTVLineColor = palette.error.main;
  }

  return (
    <Box sx={{ position: 'relative', margin: '45px 0 55px' }}>
      <Box
        sx={{
          position: 'absolute',
          bottom: 'calc(100% + 12px)',
          left: `${MaxLTVLineLeftPosition}%`,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            whiteSpace: 'nowrap',
            '&:after': {
              content: "''",
              position: 'absolute',
              width: 0,
              height: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              top: '100%',
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `8px solid ${palette.primary.light}`,
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              bottom: '1px',
              flexDirection: +currentLoanToValue * 100 > 75 ? 'column' : 'row',
              alignItems: +currentLoanToValue * 100 > 75 ? 'center' : 'flex-start',
            }}
          >
            <Typography variant="secondary12" sx={{ mr: 1 }}>
              <Trans>Max LTV</Trans>
            </Typography>
            <FormattedNumber value={currentLoanToValue} percent variant="secondary12" />
          </Box>
        </Box>
      </Box>

      <Box sx={{ position: 'absolute', top: 'calc(100% + 12px)', right: '-5px' }}>
        <Box
          sx={{
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
              borderBottom: `8px solid ${palette.error.main}`,
            },
          }}
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
              <Trans>Liquidation threshold</Trans>
            </Typography>
            <Box sx={{ display: 'flex' }}>
              <FormattedNumber value={currentLiquidationThreshold} variant="secondary12" percent />
              <Typography variant="secondary12">**</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          height: '3px',
          width: '100%',
          borderRadius: '8px',
          position: 'relative',
          bgcolor: 'divider',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            height: '5px',
            bottom: '-1px',
            borderRadius: '8px',
            width: `${LTVLineWidth}%`,
            maxWidth: '100%',
            background: LTVLineColor,
          }}
        />
      </Box>
    </Box>
  );
};
