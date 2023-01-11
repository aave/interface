import { Switch } from '@mui/material';
import React from 'react';

import { ListItemIsolationBadge } from './ListItemIsolationBadge';

interface ListItemUsedAsCollateralProps {
  isIsolated: boolean;
  usageAsCollateralEnabledOnUser: boolean;
  canBeEnabledAsCollateral: boolean;
  onToggleSwitch: () => void;
  // directly disable without additional canBeEnabledAsCollateral check for migration page
  disabled?: boolean;
}

export const ListItemUsedAsCollateral = ({
  isIsolated,
  usageAsCollateralEnabledOnUser,
  canBeEnabledAsCollateral,
  onToggleSwitch,
  disabled,
}: ListItemUsedAsCollateralProps) => {
  // TODO: fix this for migration
  const isEnabled = usageAsCollateralEnabledOnUser && canBeEnabledAsCollateral;
  return (
    <>
      {!isIsolated ? (
        <Switch
          onClick={onToggleSwitch}
          disableRipple
          checked={isEnabled}
          disabled={!canBeEnabledAsCollateral || disabled}
        />
      ) : (
        <ListItemIsolationBadge>
          <Switch
            onClick={onToggleSwitch}
            disableRipple
            checked={isEnabled}
            disabled={!canBeEnabledAsCollateral || disabled}
          />
        </ListItemIsolationBadge>
      )}
    </>
  );
};

// TO-DO: Sub out switch for row showing V2 -> V3 collateral change with check or dash
//          <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
//         <NoData variant={variant} color="text.secondary" />
