import { Box, BoxProps, Typography, TypographyProps, useMediaQuery, useTheme } from '@mui/material';
import type { ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

export const PanelRow: React.FC<BoxProps> = (props) => (
  <Box
    {...props}
    sx={{
      position: 'relative',
      display: { xs: 'block', md: 'flex' },
      margin: '0 auto',
      ...props.sx,
    }}
  />
);
/**
 * The wrapping row of `PanelItem`s at the head of a reserve panel.
 *
 * Column spacing comes from each `PanelItem`'s own `pr`/`mr`, so only the row axis is set here.
 */
export const PanelItemRow: React.FC<BoxProps> = (props) => (
  <Box
    {...props}
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'flex-start',
      rowGap: '1rem',
      ...props.sx,
    }}
  />
);
export const PanelTitle: React.FC<TypographyProps> = (props) => (
  <Typography
    {...props}
    variant="subheader1"
    sx={{ minWidth: { xs: '170px' }, mr: 4, mb: { xs: 6, md: 0 }, ...props.sx }}
  />
);

interface PanelItemProps {
  title: ReactNode;
  className?: string;
  children?: ReactNode;
}

export const PanelItem: React.FC<PanelItemProps> = ({ title, children, className }) => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      sx={{
        position: 'relative',
        alignSelf: 'stretch',
        '&:not(:last-child)': {
          pr: 4,
          mr: 4,
        },
        ...(mdUp
          ? {
              '&:not(:last-child):not(.borderless)::after': {
                content: '""',
                height: '32px',
                position: 'absolute',
                right: 4,
                top: 'calc(50% - 17px)',
                borderRight: `1px solid ${figVars['border-2']}`,
              },
            }
          : {}),
      }}
      className={className}
    >
      <Typography color="fg-2" component="span">
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
