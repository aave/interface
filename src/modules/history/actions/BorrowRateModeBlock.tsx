import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import React from 'react';

import { ActionFields, TransactionHistoryItem } from '../types';

export const BorrowRateModeBlock = ({
  swapBorrowRateTx,
  from,
}: {
  swapBorrowRateTx: TransactionHistoryItem<ActionFields['SwapBorrowRate']>;
  from?: boolean;
}) => {
  if (
    (from && swapBorrowRateTx.borrowRateModeFrom === 'Variable') ||
    swapBorrowRateTx.borrowRateModeFrom.toString() === '2'
  ) {
    return (
      <>
        <Typography variant="description" color="text.primary" pr={0.5}>
          <Trans>Variable</Trans>
        </Typography>
        <Typography variant="secondary14" color="text.primary" pr={0.5}>
          {Number(formatUnits(swapBorrowRateTx.variableBorrowRate, 25)).toFixed(2)}%
        </Typography>
        <Typography variant="description" color="text.primary">
          <Trans>APY</Trans>
        </Typography>
      </>
    );
  } else {
    return (
      <>
        <Typography variant="description" color="text.primary" pr={0.5}>
          <Trans>Stable</Trans>
        </Typography>
        <Typography variant="secondary14" color="text.primary" pr={0.5}>
          {Number(formatUnits(swapBorrowRateTx.stableBorrowRate, 25)).toFixed(2)}%
        </Typography>
        <Typography variant="description" color="text.primary">
          <Trans>APY</Trans>
        </Typography>
      </>
    );
  }
};
