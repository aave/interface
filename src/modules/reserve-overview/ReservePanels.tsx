import { Box, BoxProps, Typography, TypographyProps, useMediaQuery, useTheme } from '@mui/material';
import type { ComponentProps, ReactNode } from 'react';

export const PanelRow: React.FC<BoxProps> = (props) => (
  <Box
    {...props}
    sx={{
      position: 'relative',
      display: { xs: 'block', md: 'flex' },
      margin: '0 auto',
      py: 5,
      ...props.sx,
    }}
  />
);
export const PanelTitle: React.FC<TypographyProps> = (props) => (
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  <Typography
    variant="body6"
    color="text.primary"
    sx={{ minWidth: '120px', mr: 3, mb: { xs: 6, md: 0 }, ...props.sx }}
    component="div"
    {...props}
  />
);

interface PanelItemProps {
  title: ReactNode;
  className?: string;
  sx?: ComponentProps<typeof Box>['sx'];
}

export const PanelItem: React.FC<PanelItemProps> = ({ title, children, className, sx }) => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      sx={[
        {
          position: 'relative',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      className={className}
    >
      <Typography color="text.mainTitle" component="span" variant="detail2">
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          flex: 1,
          overflow: 'hidden',
          py: 1,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
