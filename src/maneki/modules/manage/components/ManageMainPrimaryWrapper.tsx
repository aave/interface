import { Box, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface ManageMainPrimaryWrapperProps {
  borderBottom?: boolean;
  leftComponent: ReactNode;
  rightComponent: ReactNode;
}

export default function ManageMainPrimaryWrapper({
  borderBottom,
  leftComponent,
  rightComponent,
}: ManageMainPrimaryWrapperProps) {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: downToSM ? 'column' : 'row',
        borderBottom: borderBottom ? '1px solid rgb(236, 236, 236)' : '',
        pb: '12px',
      }}
    >
      <Box sx={{ width: downToSM ? '100%' : '50%', padding: '8px 12px' }}>{leftComponent}</Box>
      <Box
        sx={{
          width: downToSM ? '100%' : '50%',
          display: 'flex',
          flexDirection: downToSM ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: downToSM ? 'left' : 'center',
          padding: '8px 12px',
          gap: downToSM ? '8px' : 'auto',
        }}
      >
        {rightComponent}
      </Box>
    </Box>
  );
}
