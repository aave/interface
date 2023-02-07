import { Box, Switch } from '@mui/material';
import React from 'react';

import { IsolatedBadge } from '../../components/isolationMode/IsolatedBadge';

interface MigrationListItemTogglerProps {
  enableAsCollateral: () => void;
  enabledAsCollateral?: boolean;
}

export const MigrationListItemToggler = ({
  enableAsCollateral,
  enabledAsCollateral,
}: MigrationListItemTogglerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Switch
        onClick={enableAsCollateral}
        disableRipple
        checked={enabledAsCollateral}
        sx={{ mb: -1.5 }}
      />
      <IsolatedBadge />
    </Box>
  );
};
