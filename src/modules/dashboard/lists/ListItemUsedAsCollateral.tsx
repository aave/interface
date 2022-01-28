import { Switch } from '@mui/material';
import React from 'react';

import { ListItemIsolationBadge } from './ListItemIsolationBadge';

interface ListItemUsedAsCollateralProps {
  isIsolated: boolean;
  usageAsCollateralEnabledOnUser: boolean;
  canBeEnabledAsCollateral: boolean;
  onToggleSwitch: () => void;
}

export const ListItemUsedAsCollateral = ({
  isIsolated,
  usageAsCollateralEnabledOnUser,
  canBeEnabledAsCollateral,
  onToggleSwitch,
}: ListItemUsedAsCollateralProps) => {
  const isEnabled = usageAsCollateralEnabledOnUser && canBeEnabledAsCollateral;
  return (
    <>
      {!isIsolated ? (
        <Switch
          onClick={onToggleSwitch}
          disableRipple
          checked={isEnabled}
          disabled={!canBeEnabledAsCollateral}
        />
      ) : (
        <ListItemIsolationBadge>
          <Switch
            onClick={onToggleSwitch}
            disableRipple
            checked={isEnabled}
            disabled={!canBeEnabledAsCollateral}
          />
        </ListItemIsolationBadge>
      )}
    </>
  );
};
