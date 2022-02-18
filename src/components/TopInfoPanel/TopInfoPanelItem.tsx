import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface TopInfoPanelItemProps {
  icon?: ReactNode;
  title: ReactNode;
  children: ReactNode;
  hideIcon?: boolean;
  variant?: 'light' | 'dark' | undefined; // default dark
  withLine?: boolean;
}

export const TopInfoPanelItem = ({
  icon,
  title,
  children,
  hideIcon,
  variant = 'dark',
  withLine,
}: TopInfoPanelItemProps) => {
  const theme = useTheme();
  const upToSM = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: { xs: 'calc(50% - 12px)', xsm: 'unset' },
      }}
    >
      {withLine && (
        <Box
          sx={{
            mr: 8,
            my: 'auto',
            width: '1px',
            bgcolor: '#FFFFFF6B',
            height: '37px',
          }}
        />
      )}

      {!hideIcon && (
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(250, 251, 252, 0.12)',
            borderRadius: '12px',
            bgcolor: '#2C2D3F',
            width: 42,
            height: 42,
            mr: 3,
          }}
        >
          {icon && icon}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{ color: variant === 'dark' ? '#FFFFFFB2' : '#47617F' }}
          variant={upToSM ? 'description' : 'caption'}
          component="div"
        >
          {title}
        </Typography>
        {children}
      </Box>
    </Box>
  );
};
