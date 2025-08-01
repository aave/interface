import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Annotation, HtmlLabel } from '@visx/annotation';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { Bar, Line, LinePath } from '@visx/shape';
import { defaultStyles, TooltipWithBounds, withTooltip } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { bisector, extent, max } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import React, { useCallback, useMemo } from 'react';

export type MeritApyDataItem = {
  day: {
    value: string;
  };
  merit_apy: number;
};

type TooltipData = MeritApyDataItem;

/**
 * Formats the given date for display in the tooltip.
 * Returns format like 'Jul 24, 2025' for standard display.
 */
const formatDate = (d: Date) => {
  const formatted = timeFormat('%b %d, %Y');
  return formatted(d);
};

// accessors
const getDate = (d: MeritApyDataItem) => new Date(d.day.value);
const bisectDate = bisector<MeritApyDataItem, Date>((d) => new Date(d.day.value)).left;
const getMeritApy = (d: MeritApyDataItem) => d.merit_apy * 100; // Convert to percentage

export type MeritApyGraphProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  data: MeritApyDataItem[];
  lineColor?: string;
  showAverage?: boolean;
};

export const MeritApyGraph = withTooltip<MeritApyGraphProps, TooltipData>(
  ({
    width,
    height,
    margin = { top: 20, right: 10, bottom: 20, left: 40 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    data,
    lineColor = '#2EBAC6',
    showAverage = true,
  }: MeritApyGraphProps & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;
    const theme = useTheme();

    // Tooltip Styles
    const accentColorDark = theme.palette.mode === 'light' ? '#383D511F' : '#a5a8b647';
    const tooltipStyles = {
      ...defaultStyles,
      padding: '8px 12px',
      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '16px',
      letterSpacing: '0.15px',
    };
    const tooltipStylesDark = {
      ...tooltipStyles,
      background: theme.palette.background.default,
    };

    // bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // scales
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [0, innerWidth],
          domain: extent(data, getDate) as [Date, Date],
        }),
      [innerWidth, data]
    );

    const yValueScale = useMemo(() => {
      const valueMax = max(data, getMeritApy) as number;
      return scaleLinear({
        range: [innerHeight, 0],
        domain: [0, (valueMax || 0) * 1.1],
        nice: true,
      });
    }, [innerHeight, data]);

    // tooltip handler
    const handleTooltip = useCallback(
      (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
        const { x: _x } = localPoint(event) || { x: 0 };
        const x = _x - margin.left;
        const x0 = dateScale.invert(x);
        const index = bisectDate(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        let d = d0;
        if (d1 && getDate(d1)) {
          d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
        }
        showTooltip({
          tooltipData: d,
          tooltipLeft: x,
        });
      },
      [showTooltip, dateScale, data, margin]
    );

    // Calculate average line if enabled
    const averageLine = useMemo(() => {
      if (!showAverage || data.length === 0) return null;

      const avg = data.reduce((acc, cur) => acc + cur.merit_apy, 0) / data.length;
      if (avg <= 0) return null;

      const avgFormatted = (avg * 100).toFixed(2);
      const avgArray = data.map((d) => ({
        ...d,
        merit_apy: avg,
      }));

      const annotationX = (dateScale(getDate(avgArray[0])) ?? 0) + 70;
      const annotationY = (yValueScale(avg * 100) ?? 0) - 8;

      return {
        avgArray,
        avgFormatted,
        annotationX,
        annotationY,
      };
    }, [data, showAverage, dateScale, yValueScale]);

    return (
      <>
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            {/* Horizontal Background Lines */}
            <GridRows
              scale={yValueScale}
              width={innerWidth}
              strokeDasharray="3,3"
              stroke={theme.palette.divider}
              pointerEvents="none"
              numTicks={3}
            />

            {/* Merit APY Line */}
            <LinePath
              key="merit-apy"
              stroke={lineColor}
              strokeWidth={2}
              data={data}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => yValueScale(getMeritApy(d)) ?? 0}
              curve={curveMonotoneX}
            />

            {/* Average Line */}
            {averageLine && (
              <>
                <LinePath
                  key="avg"
                  data={averageLine.avgArray}
                  strokeDasharray="3,5"
                  stroke="#D2D4DC"
                  strokeWidth={2}
                  x={(d) => dateScale(getDate(d)) ?? 0}
                  y={(d) => yValueScale(getMeritApy(d)) ?? 0}
                />
                <Annotation x={averageLine.annotationX} y={averageLine.annotationY}>
                  <HtmlLabel showAnchorLine={false}>
                    <Stack
                      alignItems="center"
                      direction="row"
                      justifyContent="center"
                      sx={{
                        mx: 2,
                        my: 0.5,
                        fontSize: 12,
                        background: theme.palette.divider,
                        borderRadius: '99px',
                      }}
                    >
                      <Typography sx={{ m: 1 }} noWrap variant="secondary12">
                        Avg {averageLine.avgFormatted}%
                      </Typography>
                    </Stack>
                  </HtmlLabel>
                </Annotation>
              </>
            )}

            {/* X Axis */}
            <AxisBottom
              top={innerHeight - margin.bottom / 4}
              scale={dateScale}
              strokeWidth={0}
              numTicks={4}
              tickStroke={theme.palette.text.secondary}
              tickLabelProps={() => ({
                fill: theme.palette.text.muted,
                fontSize: 10,
                textAnchor: 'middle',
                dy: 4,
              })}
            />

            {/* Y Axis */}
            <AxisLeft
              left={0}
              scale={yValueScale}
              strokeWidth={0}
              numTicks={3}
              tickFormat={(value) => `${value}%`}
              tickLabelProps={() => ({
                fill: theme.palette.text.muted,
                fontSize: 10,
                dx: -margin.left + 10,
              })}
            />

            {/* Background */}
            <Bar
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={() => hideTooltip()}
            />

            {/* Tooltip */}
            {tooltipData && (
              <g>
                <Line
                  from={{ x: tooltipLeft, y: margin.top }}
                  to={{ x: tooltipLeft, y: innerHeight }}
                  stroke={accentColorDark}
                  strokeWidth={1}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(getMeritApy(tooltipData)) + 1}
                  r={4}
                  fillOpacity={0.1}
                  strokeOpacity={0.1}
                  strokeWidth={2}
                  pointerEvents="none"
                />
                <circle
                  cx={tooltipLeft}
                  cy={yValueScale(getMeritApy(tooltipData))}
                  r={4}
                  fill={accentColorDark}
                  stroke="white"
                  strokeWidth={2}
                  pointerEvents="none"
                />
              </g>
            )}
          </Group>
        </svg>

        {/* Tooltip Info */}
        {tooltipData && (
          <div>
            <TooltipWithBounds
              top={20}
              left={tooltipLeft + 40}
              style={theme.palette.mode === 'light' ? tooltipStyles : tooltipStylesDark}
            >
              <Typography
                variant="secondary12"
                color="text.secondary"
                sx={{ mb: 2, mr: 2, fontWeight: 400 }}
              >
                {formatDate(getDate(tooltipData))}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                  Merit APY
                </Typography>
                <Typography variant="main12" color="text.primary">
                  {getMeritApy(tooltipData).toFixed(2)}%
                </Typography>
              </Box>
            </TooltipWithBounds>
          </div>
        )}
      </>
    );
  }
);

export const MeritApyPlaceholderChart = ({
  width,
  height,
  margin = { top: 20, right: 10, bottom: 20, left: 40 },
}: {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}) => {
  const theme = useTheme();

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={scaleLinear({
            range: [115, 0],
            domain: [0, 10],
            nice: true,
          })}
          width={innerWidth}
          strokeDasharray="3,3"
          stroke={theme.palette.divider}
          pointerEvents="none"
          numTicks={3}
        />

        <LinePath
          data={[
            { x: 0, y: 100 },
            { x: 100, y: 60 },
            { x: 200, y: 80 },
            { x: 300, y: 50 },
            { x: 400, y: 80 },
            { x: 500, y: 40 },
            { x: 600, y: 60 },
            { x: 700, y: 40 },
            { x: 800, y: 30 },
          ]}
          x={(d) => d.x}
          y={(d) => d.y}
          stroke={theme.palette.divider}
          strokeWidth={2}
          curve={curveMonotoneX}
        />

        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          style={{
            fill: theme.palette.text.muted,
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          No data available
        </text>

        {/* Y Axis */}
        <AxisLeft
          left={0}
          scale={scaleLinear({
            range: [115, 0],
            domain: [0, 10],
            nice: true,
          })}
          strokeWidth={0}
          numTicks={3}
          tickFormat={(value) => `${value}%`}
          tickLabelProps={() => ({
            fill: theme.palette.text.muted,
            fontSize: 10,
            dx: -margin.left + 10,
          })}
        />

        <Bar width={innerWidth} height={innerHeight} fill="transparent" pointerEvents="none" />
      </Group>
    </svg>
  );
};
