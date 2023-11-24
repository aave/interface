import { Box, CircularProgress } from '@mui/material';
import React, { ReactNode } from 'react';
import {
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import invariant from 'tiny-invariant';

interface UserAuthenticatedProps {
  children: (user: ExtendedFormattedUser) => ReactNode;
}

export const UserAuthenticated = ({ children }: UserAuthenticatedProps) => {
  const { user, loading } = useAppDataContext();
  if (loading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  invariant(user, 'User data loaded but no user found');
  return <>{children(user)}</>;
};
