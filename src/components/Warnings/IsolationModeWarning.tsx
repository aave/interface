import React from 'react';
import { Trans } from '@lingui/macro';
import { Warning } from '../primitives/Warning';
import { Typography } from '@mui/material';

export const IsolationModeWarning = () => {
  return (
    <Warning>
      <Typography color="black" variant="description">
        <Trans>
          This asset can be supplied as collateral in isolation mode only. Learn more in{' '}
        </Trans>
        <a target="_blank" rel="noreferrer" href="https://docs.aave.com/faq/">
          FAQ<Trans>guide.</Trans>
        </a>
      </Typography>
    </Warning>
  );
};
