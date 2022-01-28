import React from 'react';
import { Skeleton, ToggleButton, ToggleButtonProps, Typography } from '@mui/material';
import { Trans } from '@lingui/macro';
import { GasOption, useGasStation } from './GasStationProvider';
import { formatUnits } from 'ethers/lib/utils';

export interface GasButtonProps extends ToggleButtonProps {
  value: GasOption;
  gwei?: string | undefined;
}

export const GasButton: React.FC<GasButtonProps> = ({ value, gwei, ...props }) => (
  <ToggleButton
    value={value}
    aria-label={value}
    sx={{ fontSize: 'inherit', flexWrap: 'wrap', display: 'flex' }}
    {...props}
  >
    {gwei ? (
      <div>{formatUnits(gwei, 'gwei').replace('.0', '')}</div>
    ) : (
      <Skeleton variant="text" sx={{ width: '100%' }} />
    )}
    <Trans>{value}</Trans>
  </ToggleButton>
);
