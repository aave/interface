import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { figSurfaceShadow } from 'src/utils/figmaColors';

interface ReserveHeaderIconButtonProps {
  tooltipText: string;
  /** Button diameter — 1.75rem next to the token name, 1.25rem beside the oracle price. */
  size?: string;
  children: ReactNode;
}

// Surface icon button for the reserve header affordances (token contracts / add-to-wallet /
// oracle link): a bg-max circle with the shared shadow-low-border-2 ring. The icon color comes
// from `fg-2` (→ fg-1 on hover) via `currentColor`, so icon children only need `stroke="currentColor"`.
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
          backgroundColor: 'bg-max',
          boxShadow: figSurfaceShadow(),
          color: 'fg-2',
          cursor: 'pointer',
          transition: 'color 100ms ease',
          '&:hover': { color: 'fg-1' },
        }}
      >
        {children}
      </Box>
    </DarkTooltip>
  );
};
