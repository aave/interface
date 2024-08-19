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
        minWidth: '170px',
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
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #EBEBED1F',
              borderRadius: '12px',
              bgcolor: '#383D51',
              boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
              width: 42,
              height: 42,
              mr: 3,
            }}
          >
            {icon && icon}
          </Box>
        ))}

      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1, gap: 2 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Typography variant="body3" color="text.secondary">
            {title}
          </Typography>
          {titleIcon && titleIcon}
        </Box>

        {loading ? (
          <Skeleton
            width={60}
            height={upToSM ? 28 : 24}
            sx={(theme) => ({ background: theme.palette.background.modulePopup, mt: 1 })}
          />
        ) : (
          children
        )}
      </Box>
    </Box>
  );
};
