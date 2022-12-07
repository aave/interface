import { Box, Button } from '@mui/material';
import { signIn, useSession } from 'next-auth/react';
import { ReactNode } from 'react';

export const Unauthorized = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  if (session) {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Button sx={{ mt: 12 }} variant="outlined" onClick={() => signIn('okta')}>
        Sign in
      </Button>
    </Box>
  );
};
