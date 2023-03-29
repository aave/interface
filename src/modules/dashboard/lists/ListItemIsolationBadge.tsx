import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { CollateralType } from 'src/helpers/types';

import { IsolatedEnabledBadge } from '../../../components/isolationMode/IsolatedBadge';

interface ListItemIsolationBadgeProps {
  collateralType: CollateralType;
  children: ReactNode;
}

export const ListItemIsolationBadge = ({ children }: ListItemIsolationBadgeProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'flex-end', xsm: 'center' },
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {children}
      <IsolatedEnabledBadge />
    </Box>
  );
};
