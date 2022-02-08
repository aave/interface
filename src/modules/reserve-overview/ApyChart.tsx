import React, { useMemo, useCallback, Fragment } from 'react';
import { AreaClosed, Line, Bar, LinePath } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleTime, scaleLinear } from '@visx/scale';
import { withTooltip, defaultStyles, TooltipWithBounds } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { localPoint } from '@visx/event';
import { LinearGradient } from '@visx/gradient';
import { AxisLeft, AxisBottom } from '@visx/axis';
import { max, extent, bisector } from 'd3-array';
import { timeFormat } from 'd3-time-format';
import { lighten } from '@mui/system';
import { Group } from '@visx/group';
import { FormattedReserveHistoryItem } from 'src/hooks/useReservesHistory';
import { useTheme } from '@mui/material';
import { ChartLegend } from './ChartLegend';

type TooltipData = FormattedReserveHistoryItem;

const background = '#3b6978';
const accentColorDark = '#75daad';
const tooltipStyles = {
  ...defaultStyles,
  background,
  border: '1px solid white',
  color: 'white',
};

// util
const formatDate = timeFormat("%b %d, '%y");

// accessors
const getDate = (d: FormattedReserveHistoryItem) => new Date(d.date);
const bisectDate = bisector<FormattedReserveHistoryItem, Date>((d) => new Date(d.date)).left;
const getData = (d: FormattedReserveHistoryItem, fieldName: Field) => d[fieldName] * 100;

type Field = 'liquidityRate' | 'stableBorrowRate' | 'variableBorrowRate';

export type AreaProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  data: FormattedReserveHistoryItem[];
  fields: { name: Field; color: string; text: string }[];
};

export const ApyChart = withTooltip<AreaProps, TooltipData>(
  ({
    width,
    height,
    margin = { top: 0, right: 10, bottom: 20, left: 40 },
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft = 0,
    data,
    fields,
  }: AreaProps & WithTooltipProvidedProps<TooltipData>) => {
    if (width < 10) return null;
    const theme = useTheme();

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
      const valueMax = Math.max(
        ...fields.map((field) => max(data, (d) => getData(d, field.name)) as number)
      );
      return scaleLinear({
        range: [innerHeight, 0],
        domain: [0, valueMax || 0],
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
        <ChartLegend labels={fields} />
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            {fields.map((field) => (
              <Fragment key={field.name}>
                <LinearGradient
                  id={`area-gradient-${field.name}`}
                  from={lighten(field.color, 0.4)}
                  to={lighten(field.color, 0.9)}
                  toOpacity={0}
                />
                <AreaClosed<FormattedReserveHistoryItem>
                  data={data}
                  x={(d) => dateScale(getDate(d)) ?? 0}
                  y={(d) => yValueScale(getData(d, field.name)) ?? 0}
                  yScale={yValueScale}
                  strokeWidth={0}
                  fill={`url(#area-gradient-${field.name})`}
                  curve={curveMonotoneX}
                />
                <LinePath
                  stroke={field.color}
                  strokeWidth={2}
                  data={data}
                  x={(d) => dateScale(getDate(d)) ?? 0}
                  y={(d) => yValueScale(getData(d, field.name)) ?? 0}
                  curve={curveMonotoneX}
                />
              </Fragment>
            ))}

            <AxisBottom
              top={innerHeight - margin.bottom / 4}
              scale={dateScale}
              strokeWidth={0}
              tickStroke={theme.palette.text.secondary}
              tickLabelProps={() => ({
                fill: theme.palette.text.secondary,
                fontSize: 8,
                dx: -8,
              })}
              numTicks={innerWidth < 800 ? 5 : 10}
            />
            <AxisLeft
              left={0}
              scale={yValueScale}
              strokeWidth={0}
              tickLabelProps={() => ({
                fill: theme.palette.text.secondary,
                fontSize: 8,
                dx: -margin.left + 8,
              })}
              numTicks={5}
              tickFormat={(value) => `${(value as number).toFixed(2)} %`}
            />
            <Bar
              width={innerWidth}
              height={innerHeight}
              fill="transparent"
              onTouchStart={handleTooltip}
              onTouchMove={handleTooltip}
              onMouseMove={handleTooltip}
              onMouseLeave={() => hideTooltip()}
            />
            {tooltipData && (
              <g>
                <Line
                  from={{ x: tooltipLeft, y: margin.top }}
                  to={{ x: tooltipLeft, y: innerHeight + margin.top }}
                  stroke={accentColorDark}
                  strokeWidth={2}
                  pointerEvents="none"
                  strokeDasharray="5,2"
                />
                {fields.map((field) => {
                  return (
                    <Fragment key={field.name}>
                      <circle
                        cx={tooltipLeft}
                        cy={yValueScale(getData(tooltipData, field.name)) + 1}
                        r={4}
                        fill="black"
                        fillOpacity={0.1}
                        stroke="black"
                        strokeOpacity={0.1}
                        strokeWidth={2}
                        pointerEvents="none"
                      />
                      <circle
                        cx={tooltipLeft}
                        cy={yValueScale(getData(tooltipData, field.name))}
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
        {tooltipData && (
          <div>
            <TooltipWithBounds top={20} left={tooltipLeft + 12} style={tooltipStyles}>
              {formatDate(getDate(tooltipData))}
              <br />
              {fields.map((field) => (
                <div key={field.name}>{getData(tooltipData, field.name).toFixed(2)} %</div>
              ))}
            </TooltipWithBounds>
          </div>
        )}
      </>
    );
  }
);
