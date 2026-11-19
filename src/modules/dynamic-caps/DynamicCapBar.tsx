import { Trans } from '@lingui/macro';
import { Box, Tooltip, Typography } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { ReactElement, ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

import { formatCapAmount } from './DynamicCapChip';
import { DynamicCap } from './useDynamicCap';

const BORROWED = figVars['data-orange'];
const AVAILABLE = `color-mix(in srgb, ${figVars['data-orange']} 40%, transparent)`;

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

const LegendItem = ({ swatch, children }: { swatch: ReactNode; children: ReactNode }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, whiteSpace: 'nowrap' }}>
    {swatch}
    <Typography variant="caption" color="fg-2">
      {children}
    </Typography>
  </Box>
);

const Swatch = ({ color }: { color: string }) => (
  <Box sx={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: color }} />
);

/** The app's dark tooltip look, without its wrapping div (the parts are positioned absolutely). */
const PartTooltip = ({
  label,
  value,
  enabled,
  children,
}: {
  label: ReactNode;
  value: string;
  enabled: boolean;
  children: ReactElement;
}) => {
  if (!enabled) return children;
  return (
    <Tooltip
      placement="top"
      arrow
      enterTouchDelay={0}
      componentsProps={{
        tooltip: {
          sx: {
            color: 'fg-1',
            bgcolor: 'scrim',
            backdropFilter: 'blur(12px)',
            borderRadius: '0.5rem',
            boxShadow: `0 1px 12px 0 ${figVars['shadow-medium']}, inset 0 0 0 1px ${figVars['border-0']}`,
            '& .MuiTooltip-arrow': { color: 'scrim' },
          },
        },
      }}
      title={
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, whiteSpace: 'nowrap' }}>
          <Typography variant="caption" color="fg-2">
            {label}
          </Typography>
          <Typography variant="subheader2" color="fg-1">
            {value}
          </Typography>
        </Box>
      }
    >
      {children}
    </Tooltip>
  );
};

/**
 * Hover feedback for one part of the bar: a slight lift, and a hit area taller than the 8px bar so
 * the part is easy to land on.
 */
const hoverSx = (enabled: boolean, lift: string): SxProps<Theme> =>
  enabled
    ? {
        cursor: 'default',
        transition: 'transform 120ms ease-out',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -6,
          bottom: -6,
          left: 0,
          right: 0,
        },
        '&:hover': { transform: lift, zIndex: 2 },
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }
    : {};

type DynamicCapBarProps = {
  cap: DynamicCap;
  /** Each part lifts on hover and names its amount in a tooltip. */
  interactive?: boolean;
};

/**
 * All three levels on one scale, the max cap: what is borrowed, what the current cap still allows,
 * and how far the cap can rise.
 */
export const DynamicCapBar = ({ cap, interactive = false }: DynamicCapBarProps) => {
  const borrowedPercent = clampPercent(cap.usageOfMaxCap);
  const currentCapPercent = clampPercent((cap.currentCap / cap.maxCap) * 100);
  const availablePercent = Math.max(currentCapPercent - borrowedPercent, 0);

  const borrowed = formatCapAmount(cap.borrowed);
  const availableNow = formatCapAmount(cap.availableNow);
  const currentCap = formatCapAmount(cap.currentCap);
  const maxCap = formatCapAmount(cap.maxCap);

  return (
    <Box data-dyncap="bar" sx={{ width: '100%', mt: 6 }}>
      <Box
        role="img"
        aria-label={`Borrowed ${borrowed}, current cap ${currentCap}, max cap ${maxCap}`}
        sx={{
          position: 'relative',
          height: 8,
          borderRadius: '4px',
          backgroundColor: figVars['bg-6'],
        }}
      >
        {availablePercent > 0 && (
          <PartTooltip
            label={<Trans>Available now</Trans>}
            value={availableNow}
            enabled={interactive}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${borrowedPercent}%`,
                width: `${availablePercent}%`,
                borderRadius: '0 4px 4px 0',
                backgroundColor: AVAILABLE,
                ...hoverSx(interactive, 'scaleY(1.5)'),
              }}
            />
          </PartTooltip>
        )}
        <PartTooltip label={<Trans>Total borrowed</Trans>} value={borrowed} enabled={interactive}>
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              width: `${borrowedPercent}%`,
              borderRadius: availablePercent > 0 ? '4px 0 0 4px' : '4px',
              backgroundColor: BORROWED,
              ...hoverSx(interactive, 'scaleY(1.5)'),
            }}
          />
        </PartTooltip>
        {/* The current cap: a tick that stands clear of the bar, so it reads at any fill. Its hover
            target is wider than the 2px line. */}
        <PartTooltip label={<Trans>Current cap</Trans>} value={currentCap} enabled={interactive}>
          <Box
            sx={{
              position: 'absolute',
              top: -3,
              bottom: -3,
              left: `${currentCapPercent}%`,
              width: interactive ? 12 : 2,
              ml: interactive ? '-6px' : '-1px',
              display: 'flex',
              justifyContent: 'center',
              zIndex: 3,
              ...hoverSx(interactive, 'scale(1.3)'),
            }}
          >
            <Box sx={{ width: 2, borderRadius: '1px', backgroundColor: figVars['fg-1'] }} />
          </Box>
        </PartTooltip>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          columnGap: 5,
          rowGap: 1,
          mt: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 5, rowGap: 1 }}>
          <LegendItem swatch={<Swatch color={BORROWED} />}>
            <Trans>Borrowed {borrowed}</Trans>
          </LegendItem>
          <LegendItem swatch={<Swatch color={AVAILABLE} />}>
            <Trans>Available now {availableNow}</Trans>
          </LegendItem>
          <LegendItem
            swatch={
              <Box
                sx={{
                  width: 2,
                  height: 12,
                  borderRadius: '1px',
                  backgroundColor: figVars['fg-1'],
                }}
              />
            }
          >
            <Trans>Current cap {currentCap}</Trans>
          </LegendItem>
        </Box>
        <Typography variant="caption" color="fg-2" sx={{ whiteSpace: 'nowrap' }}>
          <Trans>Max cap {maxCap}</Trans>
        </Typography>
      </Box>
    </Box>
  );
};
