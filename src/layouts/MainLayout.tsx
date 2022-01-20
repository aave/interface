import { Box } from '@mui/material';
import React from 'react';

import LanguageSelector from '../components/LanguageSelector';
import Copyright from '../Copyright';
import AppHeader from './AppHeader';

/**
 * Main Layout component which wrapps around the whole app
 * @param param0
 * @returns
 */
export const MainLayout: React.FC = ({ children }) => {
  return (
    <>
      <AppHeader />
      <main>{children}</main>

      <Box sx={{ width: 150, margin: '0 auto' }}>
        <LanguageSelector />
      </Box>

      <Copyright sx={{ mt: 4 }} />
    </>
  );
};
