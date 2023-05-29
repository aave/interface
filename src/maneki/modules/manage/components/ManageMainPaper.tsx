import { Paper, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

export default function ManageMainContainer({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: downToSM ? '12px' : '32px',
        borderRadius: '14px',
        width: downToSM ? '100%' : '92%',
        mb: '32px',
        boxShadow: `0px 10px 30px 10px ${theme.palette.shadow.dashboard}`,
      }}
    >
      {children}
    </Paper>
  );
}
