import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import React, { ReactNode, useEffect, useState } from 'react';
import DisclaimerComponent from 'src/maneki/components/DisclaimerComponent';

import { AppHeader } from './AppHeader';

export function MainLayout({ children }: { children: ReactNode }) {
  const route = useRouter();
  const [tos, setTos] = useState(false);
  useEffect(() => {
    const manekiTOS = localStorage.getItem('manekiTOS');
    manekiTOS !== 'agreed' ? setTos(false) : setTos(true);
  }, [route]);
  if (!tos) return <DisclaimerComponent />;
  else {
    return (
      <>
        <AppHeader />
        <Box component="main" sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {children}
        </Box>
      </>
    );
  }
}
