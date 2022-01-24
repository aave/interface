import { Box, SvgIcon, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface TopInfoPanelItemProps {
  icon?: ReactNode;
  title: ReactNode;
  children: ReactNode;
}

export const TopInfoPanelItem = ({ icon, title, children }: TopInfoPanelItemProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 8 }}>
      <Box
        sx={{
          border: '1px solid rgba(250, 251, 252, 0.12)',
          borderRadius: '12px',
          bgcolor: '#2C2D3F',
          width: 42,
          height: 42,
          mr: 3,
        }}
      >
        {icon && <SvgIcon fontSize="medium">{icon}</SvgIcon>}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ color: '#FFFFFFB2' }}>{title}</Typography>
        {children}
      </Box>
    </Box>
  );
};
