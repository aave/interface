import { Box } from '@mui/material';
import { ReactNode } from 'react';

import { IsolatedBadge } from '../../../components/isolationMode/IsolatedBadge';

interface ListItemIsolationBadgeProps {
  children: ReactNode;
}

export const ListItemIsolationBadge = ({ children }: ListItemIsolationBadgeProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {children}

      <IsolatedBadge />
    </Box>
  );
};
