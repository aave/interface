import React from 'react';
import { Skeleton, ToggleButton, ToggleButtonProps, Typography } from '@mui/material';
import { GasOption } from './GasStationProvider';
import { formatUnits } from 'ethers/lib/utils';
import { Trans } from '@lingui/macro';

export interface GasButtonProps extends ToggleButtonProps {
  value: GasOption;
  gwei?: string | undefined;
}

export const GasButton: React.FC<GasButtonProps> = ({ value, gwei, ...props }) => {
  return (
    <ToggleButton
      value={value}
      aria-label={value}
      sx={{ fontSize: 'inherit', flexWrap: 'wrap', display: 'flex', minWidth: 75 }}
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
      <Typography variant="helperText" sx={{ position: 'absolute', top: -20 }}>
        <Trans>{value}</Trans>
      </Typography>
    </ToggleButton>
  );
};
