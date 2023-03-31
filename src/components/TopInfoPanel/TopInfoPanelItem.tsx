import { Box, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface TopInfoPanelItemProps {
  icon?: ReactNode;
  title: ReactNode;
  titleIcon?: ReactNode;
  children: ReactNode;
  hideIcon?: boolean;
  withoutIconWrapper?: boolean;
  variant?: 'light' | 'dark' | undefined; // default dark
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

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: { xs: 'calc(50% - 12px)', xsm: 'unset' },
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

      {!hideIcon &&
        (withoutIconWrapper ? (
          icon && icon
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3,
            }}
          >
            {icon && icon}
          </Box>
        ))}

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
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
