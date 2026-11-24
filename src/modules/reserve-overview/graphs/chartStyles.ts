import { SxProps, Theme } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';

export const dotPatternProps = {
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeDasharray: '0.1 4',
  shapeRendering: 'auto',
};

export const referenceLineProps = {
  ...dotPatternProps,
  opacity: 0.8,
  style: { stroke: figVars['fg-5'] },
};

export const gridRowsProps = {
  ...dotPatternProps,
  lineStyle: { stroke: figVars['border-0'] },
  pointerEvents: 'none',
};

export const chartMargin = { top: 40, right: 0, bottom: 40, left: 0 };

export const yAxisProps = {
  left: 0,
  strokeWidth: 0,
  hideTicks: true,
  tickLength: 0,
  tickFormat: (value: unknown) => `${value}%`,
};

export const yAxisTickLabelProps = {
  fontSize: 10,
  textAnchor: 'start' as const,
  verticalAnchor: 'end' as const,
  dx: 0,
  dy: -4,
};

export const chartRootSx: SxProps<Theme> = {
  position: 'relative',
  touchAction: 'pan-y',
};
