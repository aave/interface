import { Box, lighten, Typography, useMediaQuery, useTheme } from '@mui/material';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import { scaleLinear, scaleTime } from '@visx/scale';
import { AreaClosed, Bar, Line, LinePath } from '@visx/shape';
import { defaultStyles, TooltipWithBounds, withTooltip } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { bisector, extent, max } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import React, { Fragment, useCallback, useMemo } from 'react';
import { ReserveRateTimeRange } from 'src/hooks/useReservesHistory';

type TooltipData = GhoInterestRate;

type GhoInterestRate = {
  date: number;
  interestRate: number;
  accruedInterest: number;
};

/**
 * Formats the given date for the specified time range to display in the tooltip.
 *
 * If the provided timeRange is '1m', the date will be formatted as 'MM DD, HH:MM UTC'.
 * For example, a date of `Wed Sep 21 2022 18:00:00 GMT-0500 (Central Daylight Time)` will be formatted as `Sep 21, 18:00 UTC-05:00`
 *
 * If the provided timeRange is '6m' or '1y', the date will be formatted as 'MM DD, YYYY'.
 * For example, a date of `Wed Sep 21 2022 18:00:00 GMT-0500 (Central Daylight Time)` will be formatted as `Sep 21, 2022`
 *
 * @param {Date} d - The date to format
 * @param {ReserveRateTimeRange} timeRange - The time range of the graph
 *
 */
const formatDate = (d: Date, timeRange: ReserveRateTimeRange) => {
  if (timeRange === '1m') {
    const formatted = timeFormat('%b %d, %H:%M UTC%Z');
    const date = formatted(d);
    const offsetSign = date.toString().split('UTC')[1].split('')[0];
    const time = date.toString().split(offsetSign);
    const hours = time[1].split('').slice(0, 2).join('');
    const mins = time[1].split('').slice(2, 4).join('');
    const formattedTime = `${hours}:${mins}`;
    const formattedDate = `${time[0]}${offsetSign}${formattedTime}`;
    return formattedDate;
  } else {
    const formatted = timeFormat('%b %d, %Y');
    return formatted(d);
  }
};

// accessors
const getDate = (d: GhoInterestRate) => {
  const date = new Date(d.date);
  return date;
};
const bisectDate = bisector<GhoInterestRate, Date>((d) => new Date(d.date)).left;
const getData = (d: GhoInterestRate) => d.interestRate * 100;

type Field = 'liquidityRate' | 'stableBorrowRate' | 'variableBorrowRate';

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  data: GhoInterestRate[];
  fields: { name: string; color: string; text: string }[];
  selectedTimeRange: ReserveRateTimeRange;
};

export const GhoInterestRateGraph = withTooltip<AreaProps, TooltipData>(
  ({
    width,
    height,
    margin = { top: 0, right: 40, bottom: 20, left: 40 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    data,
    fields,
    selectedTimeRange,
  }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;
    const theme = useTheme();
    const isXsm = useMediaQuery(theme.breakpoints.down('xsm'));

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
    const xAxisNumTicks = 4; // selectedTimeRange !== '6m' || isXsm ? 3 : 4;
    const dateScale = useMemo(
      () =>
        scaleTime({
          range: [0, innerWidth],
          domain: extent(data, getDate) as [Date, Date],
        }),
      [innerWidth, data]
    );
    const yValueScale = useMemo(() => {
      const valueMax = Math.max(...fields.map((field) => max(data, (d) => getData(d)) as number));
      return scaleLinear({
        range: [innerHeight, 0],
        domain: [0, (valueMax || 0) * 1.1],
        nice: true,
      });
    }, [innerHeight, data, fields]);

    const yValueScale2 = useMemo(() => {
      const valueMax = Math.max(
        ...fields.map((field) => max(data, (d) => d.accruedInterest) as number)
      );
      return scaleLinear({
        range: [innerHeight, 0],
        domain: [0, valueMax || 0],
        nice: true,
      });
    }, [innerHeight, data, fields]);

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

            <LinearGradient
              id={`area-gradient`}
              from={lighten('#7975FB', 0.4)}
              to={lighten('#7975FB', 0.9)}
              toOpacity={0}
            />
            <AreaClosed<GhoInterestRate>
              data={data}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => yValueScale(getData(d)) ?? 0}
              yScale={yValueScale}
              strokeWidth={0}
              fill={`url(#area-gradient)`}
              curve={curveMonotoneX}
            />
            <LinePath
              stroke="#7975FB"
              strokeWidth={2}
              data={data}
              x={(d) => dateScale(getDate(d)) ?? 0}
              y={(d) => yValueScale(getData(d)) ?? 0}
              curve={curveMonotoneX}
            />

            {/* X Axis */}
            <AxisBottom
              top={innerHeight - margin.bottom / 4}
              scale={dateScale}
              strokeWidth={0}
              numTicks={xAxisNumTicks}
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

            <AxisRight
              scale={yValueScale2}
              strokeWidth={0}
              numTicks={3}
              tickFormat={(value) => '$' + value}
              tickLabelProps={() => ({
                fill: theme.palette.text.muted,
                fontSize: 10,
                dx: innerWidth,
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
                {fields.map((field) => {
                  return (
                    <Fragment key={field.name}>
                      <circle
                        cx={tooltipLeft}
                        cy={yValueScale(getData(tooltipData)) + 1}
                        r={4}
                        fillOpacity={0.1}
                        strokeOpacity={0.1}
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                      <circle
                        cx={tooltipLeft}
                        cy={yValueScale(getData(tooltipData))}
                        r={4}
                        fill={accentColorDark}
                        stroke="white"
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                    </Fragment>
                  );
                })}
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
                {formatDate(getDate(tooltipData), selectedTimeRange)}
              </Typography>
              {fields.map((field) => (
                <Box
                  key={field.name}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                    {field.text}
                  </Typography>
                  <Typography variant="main12" color="text.primary">
                    {getData(tooltipData).toFixed(2)}%
                  </Typography>
                  <Typography variant="main12" color="text.primary">
                    {tooltipData.accruedInterest}
                  </Typography>
                </Box>
              ))}
            </TooltipWithBounds>
          </div>
        )}
      </>
    );
  }
);
