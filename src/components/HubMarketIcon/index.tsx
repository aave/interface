import { useId } from 'react';
import { figVars } from 'src/utils/figmaColors';

import { HUB_MARKET_GLYPHS, HubMarketKind, tileBorderWidth } from './utils/glyphs';

const DARKEST_AT = 0.326923;

const TONES = {
  migration: {
    tile: figVars['migration-hub-tile'],
    edge: figVars['migration-glyph-edge'],
    darkest: figVars['migration-glyph-darkest'],
    opacity: 0.6,
  },
  grey: {
    tile: figVars['bg-5'],
    edge: figVars['migration-glyph-grey-edge'],
    darkest: figVars['migration-glyph-grey-darkest'],
    opacity: 0.6,
  },
  picker: {
    tile: figVars['bg-3'],
    edge: figVars['migration-glyph-picker-edge'],
    darkest: figVars['migration-glyph-picker-darkest'],
    opacity: 0.5,
  },
};

export const HubMarketIcon = ({
  kind,
  size,
  tone = 'migration',
}: {
  kind: HubMarketKind;
  size: number;
  tone?: keyof typeof TONES;
}) => {
  const colors = TONES[tone];
  const gradientId = `glyph-${useId().replace(/:/g, '')}`;
  const glyph = HUB_MARKET_GLYPHS[kind];
  const borderWidth = (tileBorderWidth(size) * 56) / size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 56 56"
      fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <rect width="56" height="56" rx="16.8" style={{ fill: colors.tile }} />
      <rect
        x={borderWidth / 2}
        y={borderWidth / 2}
        width={56 - borderWidth}
        height={56 - borderWidth}
        rx={16.8 - borderWidth / 2}
        strokeWidth={borderWidth}
        style={{ stroke: figVars['border-0'] }}
      />
      <g opacity={colors.opacity}>
        {/* Figma's market exports carry this solid copy; only its anti-aliased edge shows */}
        {kind === 'market' ? (
          <path d={glyph.d} style={{ fill: figVars['migration-fg-5'] }} />
        ) : null}
        <path d={glyph.d} fill={`url(#${gradientId})`} />
      </g>
      <defs>
        <linearGradient id={gradientId} {...glyph.gradient} gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: colors.edge }} />
          <stop offset={DARKEST_AT} style={{ stopColor: colors.darkest }} />
          <stop offset={1} style={{ stopColor: colors.edge }} />
        </linearGradient>
      </defs>
    </svg>
  );
};
