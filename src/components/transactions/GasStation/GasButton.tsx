import { Skeleton, ToggleButton, ToggleButtonProps, Typography } from '@mui/material';
import { formatUnits } from 'ethers/lib/utils';
import React from 'react';

import { GasOption } from './GasStationProvider';

export interface GasButtonProps extends ToggleButtonProps {
  value: GasOption;
  gwei?: string | undefined;
}

export const GasButton: React.FC<GasButtonProps> = ({ value, gwei, ...props }) => {
  return (
    <ToggleButton value={value} aria-label={value} sx={{ p: 2, height: '36px' }} {...props}>
      {gwei ? (
        <Typography variant={props.selected ? 'subheader1' : 'description'}>
          {parseFloat(formatUnits(gwei, 'gwei')).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}
        </Typography>
      ) : (
        <Skeleton variant="text" sx={{ width: '100%' }} />
      )}
    </ToggleButton>
  );
};
