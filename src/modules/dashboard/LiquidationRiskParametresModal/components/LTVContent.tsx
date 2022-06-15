import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Typography, useTheme } from '@mui/material';
import BigNumber from 'bignumber.js';
import React from 'react';

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
    .multipliedBy(100)
    .precision(20, BigNumber.ROUND_UP)
    .toNumber();

  const CurrentLTVLineWidth = valueToBigNumber(currentLoanToValue)
    .multipliedBy(100)
    .precision(20, BigNumber.ROUND_UP)
    .toNumber();

  const currentLiquidationThresholdLeftPosition = valueToBigNumber(currentLiquidationThreshold)
    .multipliedBy(100)
    .precision(20, BigNumber.ROUND_UP)
    .toNumber();

  let LTVLineColor = palette.success.main;
  if (
    +loanToValue * 100 < +currentLoanToValue * 100 &&
    +loanToValue * 100 > +currentLoanToValue * 100 - (+currentLoanToValue * 100) / 2
  ) {
    LTVLineColor = palette.warning.main;
  } else if (+loanToValue * 100 > +currentLiquidationThreshold * 100) {
    LTVLineColor = palette.error.main;
  }

  return (
    <Box sx={{ position: 'relative', margin: '45px 0 55px' }}>
      <Box
        sx={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: `${
            currentLiquidationThresholdLeftPosition > 100
              ? 100
              : currentLiquidationThresholdLeftPosition
          }%`,
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            whiteSpace: 'nowrap',
            '&:after': {
              content: "''",
              position: 'absolute',
              left: +currentLiquidationThreshold * 100 > 75 ? 'auto' : '50%',
              transform:
                +currentLiquidationThreshold * 100 > 75 ? 'translateX(0)' : 'translateX(-50%)',
              right: +currentLiquidationThreshold * 100 > 75 ? 0 : 'auto',
              bottom: '100%',
              height: '10px',
              width: '2px',
              bgcolor: 'error.main',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              position: 'absolute',
              left: +currentLiquidationThreshold * 100 > 75 ? 'auto' : '50%',
              transform:
                +currentLiquidationThreshold * 100 > 75 ? 'translateX(0)' : 'translateX(-50%)',
              right: +currentLiquidationThreshold * 100 > 75 ? 0 : 'auto',
              flexDirection: 'column',
              alignItems: +currentLiquidationThreshold * 100 > 75 ? 'flex-end' : 'center',
              textAlign: +currentLiquidationThreshold * 100 > 75 ? 'right' : 'center',
            }}
          >
            <FormattedNumber
              value={currentLiquidationThreshold}
              visibleDecimals={2}
              color="error.main"
              variant="subheader2"
              percent
              symbolsColor="error.main"
            />
            <Typography
              sx={{ display: 'flex' }}
              variant="helperText"
              lineHeight="12px"
              color="error.main"
            >
              <Trans>
                Liquidation <br /> threshold
              </Trans>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: 'calc(100% + 6px)',
          left: `${LTVLineWidth > 100 ? 100 : LTVLineWidth}%`,
          zIndex: 3,
        }}
      >
        <Box
          sx={(theme) => ({
            position: 'relative',
            whiteSpace: 'nowrap',
            '&:after': {
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '6px 4px 0 4px',
              borderColor: `${theme.palette.primary.main} transparent transparent transparent`,
              content: "''",
              position: 'absolute',
              left: LTVLineWidth > 75 ? 'auto' : '50%',
              right: LTVLineWidth > 75 ? 0 : 'auto',
              transform: LTVLineWidth > 75 ? 'translateX(0)' : 'translateX(-50%)',
            },
          })}
        >
          <Box
            sx={{
              display: 'flex',
              position: 'absolute',
              left: LTVLineWidth > 75 ? 'auto' : LTVLineWidth < 15 ? '0' : '50%',
              transform:
                LTVLineWidth > 75 || LTVLineWidth < 15 ? 'translateX(0)' : 'translateX(-50%)',
              right: LTVLineWidth > 75 ? 0 : 'auto',
              flexDirection: 'column',
              alignItems:
                LTVLineWidth > 75 ? 'flex-end' : LTVLineWidth < 15 ? 'flex-start' : 'center',
              textAlign: LTVLineWidth > 75 ? 'right' : LTVLineWidth < 15 ? 'left' : 'center',
              bottom: 'calc(100% + 2px)',
            }}
          >
            <FormattedNumber value={loanToValue} percent visibleDecimals={2} variant="main12" />
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <Typography variant="helperText" color="text.muted" mr={0.5}>
                <Trans>MAX</Trans>
              </Typography>
              <FormattedNumber
                value={currentLoanToValue}
                percent
                visibleDecimals={2}
                variant="helperText"
                color="text.muted"
                symbolsColor="text.muted"
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          height: '4px',
          width: '100%',
          borderRadius: '1px',
          position: 'relative',
          bgcolor: 'divider',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            height: '4px',
            borderRadius: '1px',
            width: `${LTVLineWidth > 100 ? 100 : LTVLineWidth}%`,
            maxWidth: '100%',
            background: LTVLineColor,
            zIndex: 2,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            left: 0,
            height: '4px',
            borderRadius: '1px',
            width: `${CurrentLTVLineWidth > 100 ? 100 : CurrentLTVLineWidth}%`,
            maxWidth: '100%',
            background: `repeating-linear-gradient(-45deg, ${palette.divider}, ${palette.divider} 4px, ${LTVLineColor} 4px, ${LTVLineColor} 7px)`,
          }}
        />
      </Box>
    </Box>
  );
};
