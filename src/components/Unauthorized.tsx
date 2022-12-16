import { Box, Button } from '@mui/material';
import { signIn, useSession } from 'next-auth/react';
import Gho from 'public/icons/tokens/gho.svg';
import { ReactNode } from 'react';

import LoveGhost from '/public/loveGhost.svg';

export const Unauthorized = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();

  if (session || process.env.NODE_ENV !== 'production') {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Button
        sx={{ mt: 14 }}
        variant="outlined"
        disabled={status === 'loading'}
        onClick={() => signIn('okta')}
        endIcon={<Gho />}
      >
        Let&apos;s GHOOO
      </Button>
      <LoveGhost style={{ marginBottom: '16px' }} />
    </Box>
  );
};
