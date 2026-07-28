import { Box, Container, ContainerProps, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Number of stat columns — laid out as `grid-template-columns: repeat(columns, 1fr)`. */
  columns: number;
  containerProps?: ContainerProps;
}

/**
 * Reusable page header. Same outer band (bg / bottom hairline / padding) as `TopInfoPanel`, with a
 * left title+description block and a right-aligned row of `PageHeaderStat` items. First adopted on
 * `/staking`; intended to replace other pages' top info panels over time.
 */
export const PageHeader = ({
  title,
  description,
  children,
  columns,
  containerProps = {},
}: PageHeaderProps) => {
  return (
    <Box
      sx={{
        pt: { xs: 10, md: 12 },
        pb: { xs: 10, md: 12 },
        color: 'fg-1',
        boxShadow: `0px 1px 0px ${figVars['border-0']}`,
        // Mirrors TopInfoPanel: gradient (one→two) over solid color-three (a separate bg layer).
        // Light tokens are all #fafafa → renders solid; dark gets the tint (P3 via the token vars).
        background: `linear-gradient(180deg, ${figVars['info-panel-color-one']} 0%, ${figVars['info-panel-color-two']} 100%), ${figVars['info-panel-color-three']}`,
      }}
    >
      <Container {...containerProps} sx={{ ...containerProps.sx, pb: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            gap: 4,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '1rem',
            }}
          >
            <Typography variant="h2" sx={{ fontSize: '1.875rem', color: 'fg-1' }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="h5" sx={{ color: 'fg-3', textWrap: 'balance' }}>
                {description}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: '2.5rem',
            }}
          >
            {children}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
