import { Paper } from '@mui/material';
import { ReactNode } from 'react';

export default function ManageMainContainer({ children }: { children: ReactNode }) {
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        borderRadius: '14px',
        width: '92%',
        mb: '32px',
      }}
    >
      {children}
    </Paper>
  );
}
