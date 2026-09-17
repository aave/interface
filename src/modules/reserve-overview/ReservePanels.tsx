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
 * Centring only lines the item dividers up while the row is single-line, and `PanelItem` draws
 * those from `md` up — so below `md`, where the items wrap, each line top-aligns instead and a
 * short stat (an APY has no USD sub-line) stops floating against its taller neighbour. Column
 * spacing comes from each `PanelItem`'s own `pr`/`mr`, so only the row axis is set here.
 */
export const PanelItemRow: React.FC<BoxProps> = (props) => (
  <Box
    {...props}
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: { xs: 'flex-start', md: 'center' },
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
