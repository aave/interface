import React from 'react';
import { Skeleton, ToggleButton, ToggleButtonProps } from '@mui/material';
import { Trans } from '@lingui/macro';
import { GasOption } from './GasStationProvider';
import { formatUnits } from 'ethers/lib/utils';

export interface GasButtonProps extends ToggleButtonProps {
  value: GasOption;
  gwei?: string | undefined;
}

export const GasButton: React.FC<GasButtonProps> = ({ value, gwei, ...props }) => {
  return (
    <ToggleButton
      value={value}
      aria-label={value}
      sx={{ fontSize: 'inherit', flexWrap: 'wrap', display: 'flex' }}
      {...props}
    >
      {gwei ? (
        <div>
          {parseFloat(formatUnits(gwei, 'gwei')).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </div>
      ) : (
        <Skeleton variant="text" sx={{ width: '100%' }} />
      )}
      <Trans>{value}</Trans>
    </ToggleButton>
  );
};
