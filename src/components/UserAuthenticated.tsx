import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import {
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';

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
  
  // Handle disconnection gracefully instead of crashing
  if (!user) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
        <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
          <Trans>Please connect your wallet to continue.</Trans>
        </Typography>
        <ConnectWalletButton />
      </Box>
    );
  }
  
  return <>{children(user)}</>;
};
