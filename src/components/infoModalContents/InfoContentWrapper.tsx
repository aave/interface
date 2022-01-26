import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

interface InfoContentWrapperProps {
  children: ReactNode;
  caption: ReactNode;
}

export const InfoContentWrapper = ({ children, caption }: InfoContentWrapperProps) => {
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', textAlign: 'center', alignItems: 'center' }}
    >
      <Typography variant="h2" sx={{ mb: 2 }}>
        {caption}
      </Typography>
      {children}
    </Box>
  );
};
