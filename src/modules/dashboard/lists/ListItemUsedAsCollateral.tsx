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
  const isEnabled = usageAsCollateralEnabledOnUser && canBeEnabledAsCollateral;
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onToggleSwitch();
  };
  const switchProps = {
    onClick: handleClick,
    disableRipple: true,
    checked: isEnabled,
    disabled: !canBeEnabledAsCollateral || disabled,
  };

  return isIsolated ? (
    <ListItemIsolationBadge>
      <Switch {...switchProps} />
    </ListItemIsolationBadge>
  ) : (
    <Switch {...switchProps} />
  );
};
