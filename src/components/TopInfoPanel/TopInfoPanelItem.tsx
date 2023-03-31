import { Box, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface TopInfoPanelItemProps {
  icon?: ReactNode;
  title: ReactNode;
  titleIcon?: ReactNode;
  children: ReactNode;
  hideIcon?: boolean;
  withoutIconWrapper?: boolean;
  withLine?: boolean;
  loading?: boolean;
}

export const TopInfoPanelItem = ({
  icon,
  title,
  titleIcon,
  children,
  hideIcon,
  withLine,
  loading,
  withoutIconWrapper,
}: TopInfoPanelItemProps) => {
  const theme = useTheme();
  const upToSM = useMediaQuery(theme.breakpoints.up('sm'));
  /* {Temporary for unused props} */
  hideIcon && withoutIconWrapper;
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: { xs: 'calc(50% - 12px)', xsm: '238px' },
        padding: '20px',
        backgroundColor: theme.palette.background.surface,
        borderRadius: '8px',
      }}
    >
      {withLine && (
        <Box
          sx={{
            mr: 8,
            my: 'auto',
            width: '1px',
            bgcolor: '#F2F3F729',
            height: '37px',
          }}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'top' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3,
              width: '18px',
              height: '18px',
            }}
          >
            {icon && icon}
          </Box>
          <Typography
            sx={{ color: theme.palette.text.secondary }}
            variant="description"
            component="div"
          >
            {title}
          </Typography>
          {titleIcon && titleIcon}
        </Box>
        {loading ? <Skeleton height={upToSM ? 28 : 24} sx={{ background: '#383D51' }} /> : children}
      </Box>
    </Box>
  );
};
