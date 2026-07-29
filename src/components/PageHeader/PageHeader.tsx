import { Box, Container, ContainerProps, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  containerProps?: ContainerProps;
  /** Optional icon rendered before the heading-wrapped title. Ignored when `disableTitleTypography` is set. */
  titleIcon?: ReactNode;
  /**
   * Render `title` as-is instead of wrapping it in the heading Typography. Use when the title is
   * itself a styled/interactive node (e.g. the dashboard's MarketSwitcher, which brings its own
   * title text + description).
   */
  disableTitleTypography?: boolean;
}

/**
 * Reusable page header. Same outer band (bg / bottom hairline / padding) as `TopInfoPanel`, with a
 * left title+description block and a right-aligned row of `PageHeaderStat` items. First adopted on
 * `/staking`; intended to replace other pages' top info panels over time.
 */
export const PageHeader = ({
  title,
  titleIcon,
  description,
  children,
  containerProps = {},
  disableTitleTypography = false,
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
            {disableTitleTypography ? (
              title
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {titleIcon}
                <Typography variant="h2" sx={{ fontSize: '1.875rem', color: 'fg-1' }}>
                  {title}
                </Typography>
              </Box>
            )}
            {description && (
              <Typography variant="h5" sx={{ color: 'fg-3', textWrap: 'balance' }}>
                {description}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
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
