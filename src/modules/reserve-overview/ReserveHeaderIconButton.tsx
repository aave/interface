import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { figSurfaceShadow } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

interface ReserveHeaderIconButtonProps {
  tooltipText: string;
  /** Button diameter — 1.75rem next to the token name, 1.25rem beside the oracle price. */
  size?: string;
  children: ReactNode;
}

// Surface icon button for the reserve header affordances (token contracts / add-to-wallet /
// oracle link): a bg-3 circle with the shared shadow-low-border-2 ring in light, and a flat fill
// with no ring in dark — the same treatment the pill buttons get, since shadow-stroke-2 is a
// visible white hairline against the dark canvas. The icon color is a constant `fg-2` via
// `currentColor` (icon children only need `stroke="currentColor"`); hover tints the circle
// background instead — one step down the ramp to bg-5.
export const ReserveHeaderIconButton = ({
  tooltipText,
  size = '1.75rem',
  children,
}: ReserveHeaderIconButtonProps) => {
  return (
    <DarkTooltip
      title={
        <Typography>
          <Trans>{tooltipText}</Trans>
        </Typography>
      }
    >
      <Box
        sx={{
          width: size,
          height: size,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'bg-3',
          boxShadow: figSurfaceShadow(),
          ...darkScheme({ boxShadow: 'none' }),
          color: 'fg-2',
          cursor: 'pointer',
          transition: 'background-color 100ms ease',
          // Hover tints the circle, not the icon.
          '&:hover': { backgroundColor: 'bg-5' },
        }}
      >
        {children}
      </Box>
    </DarkTooltip>
  );
};
