import { useId } from 'react';
import { figVars } from 'src/utils/figmaColors';

import { HUB_MARKET_GLYPHS, HubMarketKind, tileBorderWidth } from './utils/glyphs';

const GLYPH_OPACITY = 0.6;
const DARKEST_AT = 0.326923;

export const HubMarketIcon = ({
  kind,
  size,
  background = figVars['migration-hub-tile'],
}: {
  kind: HubMarketKind;
  size: number;
  background?: string;
}) => {
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
      <rect width="56" height="56" rx="16.8" style={{ fill: background }} />
      <rect
        x={borderWidth / 2}
        y={borderWidth / 2}
        width={56 - borderWidth}
        height={56 - borderWidth}
        rx={16.8 - borderWidth / 2}
        strokeWidth={borderWidth}
        style={{ stroke: figVars['border-0'] }}
      />
      <g opacity={GLYPH_OPACITY}>
        {/* Figma's market exports carry this solid copy; only its anti-aliased edge shows */}
        {kind === 'market' ? (
          <path d={glyph.d} style={{ fill: figVars['migration-fg-5'] }} />
        ) : null}
        <path d={glyph.d} fill={`url(#${gradientId})`} />
      </g>
      <defs>
        <linearGradient id={gradientId} {...glyph.gradient} gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: figVars['migration-glyph-edge'] }} />
          <stop offset={DARKEST_AT} style={{ stopColor: figVars['migration-glyph-darkest'] }} />
          <stop offset={1} style={{ stopColor: figVars['migration-glyph-edge'] }} />
        </linearGradient>
      </defs>
    </svg>
  );
};
