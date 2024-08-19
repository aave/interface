import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import React from 'react';

import { ActionFields, TransactionHistoryItem } from '../types';

export const BorrowRateModeBlock = ({
  swapBorrowRateTx,
  borrowRateMode,
}: {
  swapBorrowRateTx: TransactionHistoryItem<ActionFields['SwapBorrowRate']>;
  borrowRateMode: string;
}) => {
  if (borrowRateMode === 'Variable' || borrowRateMode === '2') {
    return (
      <>
        <Typography variant="body3" color="text.primary" pr={0.5}>
          <Trans>Variable</Trans>
        </Typography>
        <Typography variant="body3" color="text.primary" pr={0.5}>
          {Number(formatUnits(swapBorrowRateTx.variableBorrowRate, 25)).toFixed(2)}%
        </Typography>
        <Typography variant="body3" color="text.primary">
          <Trans>APY</Trans>
        </Typography>
      </>
    );
  } else {
    return (
      <>
        <Typography variant="body3" color="text.primary" pr={0.5}>
          <Trans>Stable</Trans>
        </Typography>
        <Typography variant="body3" color="text.primary" pr={0.5}>
          {Number(formatUnits(swapBorrowRateTx.stableBorrowRate, 25)).toFixed(2)}%
        </Typography>
        <Typography variant="body3" color="text.primary">
          <Trans>APY</Trans>
        </Typography>
      </>
    );
  }
};
