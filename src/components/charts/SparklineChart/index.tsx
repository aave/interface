import { Box } from '@mui/material';
import { curveLinear } from '@visx/curve';
import { scaleLinear, scaleTime } from '@visx/scale';
import { area } from '@visx/shape';
import { extent, max, min } from 'd3-array';
import { motion } from 'motion/react';
import { ReactNode, useCallback, useEffect, useId, useMemo, useState } from 'react';
import { figVars } from 'src/utils/figmaColors';

import { AxisLegendLeftFade, EASED_FADE_STOPS, FadeStop } from '../AxisLegendLeftFade';
import { ChartEndDot } from '../ChartEndDot';
import { useElementWidth } from '../hooks/useElementWidth';
import { MotionLinePath } from '../MotionLinePath';
import { resampleSeries } from '../utils/resample';

export interface SparklineDatum {
  date: string | Date;
  value: number;
}

interface SparklineChartProps {
  data?: SparklineDatum[];
  loading?: boolean;
  color?: string;
  height?: number;
  baseline?: number;
  baselineLabel?: ReactNode;
  showArea?: boolean;
  showEndDot?: boolean;
  pulseDot?: boolean;
  fadeLeft?: boolean;
  safeArea?: { top: number; bottom: number };
  resolution?: number;
}

const DOT_RADIUS = 4;
const FADE_WIDTH = 18;
const LABELLED_FADE_WIDTH = 42;
const LABELLED_FADE_STOPS: FadeStop[] = [
  { offset: 0, opacity: 0 },
  ...EASED_FADE_STOPS.map((stop) => ({
    offset: 0.5 + stop.offset * 0.5,
    opacity: stop.opacity,
  })),
];
const SETTLE = { duration: 0.3, ease: [0.4, 0, 0.2, 1] } as const;
const SETTLE_TRANSITION = ['transform', 'opacity', 'color']
  .map((property) => `${property} 300ms cubic-bezier(0.4, 0, 0.2, 1)`)
  .join(', ');

// Wave and series must share a point count, or their paths can't tween
const DEFAULT_RESOLUTION = 32;
const WAVE_DOMAIN: [number, number] = [-2.2, 2.2];

const getDate = (d: SparklineDatum) => (d.date instanceof Date ? d.date : new Date(d.date));
const getValue = (d: SparklineDatum) => d.value;

const makeWave = (points: number): SparklineDatum[] =>
  Array.from({ length: points }, (_, i) => ({
    date: new Date(i),
    value: Math.sin((i / (points - 1)) * Math.PI * 2),
  }));

const Fade = ({
  width,
  height,
  enabled,
  labelled,
  children,
}: {
  width: number;
  height: number;
  enabled?: boolean;
  labelled: boolean;
  children: ReactNode;
}) => {
  if (enabled !== true) return <>{children}</>;

  return (
    <AxisLegendLeftFade
      width={width}
      height={height}
      fadeWidth={labelled ? LABELLED_FADE_WIDTH : FADE_WIDTH}
      stops={labelled ? LABELLED_FADE_STOPS : EASED_FADE_STOPS}
    >
      {children}
    </AxisLegendLeftFade>
  );
};

export const SparklineChart = ({
  data,
  loading,
  color = figVars['data-green'],
  height = 96,
  baseline,
  baselineLabel,
  showArea = true,
  showEndDot = true,
  pulseDot = true,
  fadeLeft,
  safeArea = { top: 10, bottom: 6 },
  resolution = DEFAULT_RESOLUTION,
}: SparklineChartProps) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const gradientId = useId();
  const { ref: containerRef, width } = useElementWidth<HTMLDivElement>();

  const resting = loading === true || !data || data.length === 0;
  const points = useMemo(
    () => (resting ? makeWave(resolution) : resampleSeries(data ?? [], resolution)),
    [resting, data, resolution]
  );

  const right = Math.max(width - (showEndDot ? DOT_RADIUS : 0), 1);

  const dateScale = useMemo(
    () =>
      scaleTime({
        range: [0, right],
        domain:
          points.length > 1
            ? (extent(points, getDate) as [Date, Date])
            : [new Date(0), new Date(1)],
      }),
    [right, points]
  );

  const valueScale = useMemo(() => {
    const lo = Math.min(min(points, getValue) ?? 0, baseline ?? Number.POSITIVE_INFINITY);
    const hi = Math.max(max(points, getValue) ?? 0, baseline ?? Number.NEGATIVE_INFINITY);

    return scaleLinear({
      range: [height - safeArea.bottom, safeArea.top],
      domain: resting ? WAVE_DOMAIN : lo === hi ? [lo - 1, hi + 1] : [lo, hi],
    });
  }, [height, safeArea.top, safeArea.bottom, points, resting, baseline]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsFirstLoad(false), 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const lastPoint = points[points.length - 1];
  const baselineValue = resting ? 0 : baseline ?? points[0]?.value;
  const baselineY = baselineValue === undefined ? 0 : valueScale(baselineValue) ?? 0;

  const getX = useCallback((d: SparklineDatum) => dateScale(getDate(d)) ?? 0, [dateScale]);
  const getY = useCallback((d: SparklineDatum) => valueScale(getValue(d)) ?? 0, [valueScale]);

  const areaPath = useMemo(
    () =>
      showArea
        ? area<SparklineDatum>({
            x: getX,
            y1: getY,
            y0: valueScale.range()[0],
            curve: curveLinear,
          })(points) ?? ''
        : '',
    [showArea, points, getX, getY, valueScale]
  );

  const transition = isFirstLoad ? { duration: 0 } : SETTLE;

  return (
    <Box ref={containerRef} sx={{ position: 'relative', width: '100%', height }}>
      {width > 0 && points.length > 0 && (
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${Math.max(width, 1)} ${height}`}
          aria-hidden
          style={{ display: 'block', overflow: 'visible' }}
        >
          {showArea && (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.22 }} />
                <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
              </linearGradient>
            </defs>
          )}

          <Box
            component="g"
            style={{ transform: `translateY(${baselineY}px)` }}
            sx={{
              transformBox: 'fill-box',
              transformOrigin: 'center',
              transition: SETTLE_TRANSITION,
              '& line': { stroke: figVars['fg-4'], opacity: 0.4 },
            }}
          >
            <line x1={0} x2={right} strokeWidth={1} strokeDasharray="2 3" />
          </Box>

          <Fade width={width} height={height} enabled={fadeLeft} labelled={Boolean(baselineLabel)}>
            {showArea && (
              <Box component="g" sx={{ opacity: resting ? 0 : 1, transition: SETTLE_TRANSITION }}>
                <motion.path
                  initial={false}
                  animate={{ d: areaPath }}
                  transition={transition}
                  fill={`url(#${gradientId})`}
                  stroke="none"
                />
              </Box>
            )}

            <Box
              component="g"
              sx={{
                color: resting ? 'fg-4' : color,
                opacity: resting ? 0.35 : 1,
                transition: SETTLE_TRANSITION,
              }}
            >
              <MotionLinePath<SparklineDatum>
                data={points}
                getX={getX}
                getY={getY}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
                curve={curveLinear}
                isSelected
                disableInitialAnimation={isFirstLoad}
              />
            </Box>
          </Fade>

          {showEndDot && lastPoint !== undefined && (
            <Box
              component="g"
              style={{ transform: `translate(${getX(lastPoint)}px, ${getY(lastPoint)}px)` }}
              sx={{ opacity: resting ? 0 : 1, transition: SETTLE_TRANSITION }}
            >
              <ChartEndDot color={color} pulse={pulseDot && !resting} radius={DOT_RADIUS} />
            </Box>
          )}
        </svg>
      )}
      {baselineLabel && width > 0 && (
        <Box
          component="span"
          style={{ transform: `translateY(${baselineY}px)` }}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            translate: '-0.25rem calc(-100% - 0.125rem)',
            color: 'fg-3',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            fontSize: '0.5625rem',
            fontWeight: 400,
            lineHeight: 1.35,
            opacity: resting ? 0 : 1,
            transition: SETTLE_TRANSITION,
          }}
        >
          {baselineLabel}
        </Box>
      )}
    </Box>
  );
};
